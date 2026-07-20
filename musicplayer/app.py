"""ローカルミュージックプレイヤーのバックエンド。"""

import base64
import hashlib
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import time
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path
from flask import Flask, Response, jsonify, redirect, request, send_file, send_from_directory

from mutagen import File as MutagenFile
from mutagen.asf import ASF
from mutagen.id3 import APIC, ID3
from mutagen.flac import FLAC, Picture
from mutagen.mp4 import MP4, MP4Cover

# PyInstaller バンドル時は sys._MEIPASS にバンドルリソースが展間される
if getattr(sys, 'frozen', False):
    _BUNDLE_DIR = Path(sys._MEIPASS)          # templates/, static/ の住まい
    APP_DIR = Path(sys.executable).parent      # EXE 障のユーザデータ
else:
    _BUNDLE_DIR = Path(__file__).parent
    APP_DIR = _BUNDLE_DIR

app = Flask(__name__,
    static_folder=str(_BUNDLE_DIR / "static"),
    template_folder=str(_BUNDLE_DIR / "templates"))

APP_DIR = APP_DIR  # keep reference
DEFAULT_MUSIC_DIR = APP_DIR / "music"
LIBRARY_PATH_FILE = APP_DIR / "library_path.txt"
MUSIC_DIR = DEFAULT_MUSIC_DIR
PLAYLIST_DIR = APP_DIR / "playlists"
SUPPORTED_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".ogg",
    ".opus",
    ".flac",
    ".m4a",
    ".mp4",
    ".aac",
    ".wma",
    ".aif",
    ".aiff",
    ".alac",
}
# ブラウザに正しく認識されるMIMEタイプマッピング（WindowsRegitrsyに欠約あり）
AUDIO_MIME_TYPES: dict[str, str] = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".opus": "audio/ogg",
    ".flac": "audio/flac",
    ".m4a": "audio/mp4",
    ".mp4": "audio/mp4",
    ".aac": "audio/aac",
    ".wma": "audio/x-ms-wma",
    ".aif": "audio/aiff",
    ".aiff": "audio/aiff",
    ".alac": "audio/mp4",
}
# ブラウザネイティブでデコードできないフォーマット → FFmpegでOgg Opusにリアルタイムトランスコード
TRANSCODE_EXTENSIONS: frozenset[str] = frozenset({".alac", ".wma", ".aif", ".aiff"})

# 音質の良い順（小さいほど優先）。同一ステム名で複数拡張子が存在する場合に使用。
EXTENSION_QUALITY_RANK: dict[str, int] = {
    ".flac": 0,
    ".wav": 1,
    ".alac": 2,
    ".aiff": 3,
    ".aif": 4,
    ".ogg": 5,
    ".opus": 6,
    ".m4a": 7,
    ".aac": 8,
    ".mp3": 9,
    ".wma": 10,
    ".mp4": 11,
}
SUPPORTED_PLAYLIST_EXTENSIONS = {".txt", ".json"}
SIDECAR_ART_FILENAMES = (
    "soundtrack_capsule.jpg",
    "soundtrack_capsule.jpeg",
    "soundtrack_capsule.png",
    "folder.jpg",
    "folder.jpeg",
    "folder.png",
)
SOUNDTRACK_HINTS = ("soundtrack", "original soundtrack", " ost", "ost ", " ost ", "bgm")

TRACK_METADATA_CACHE: dict[str, dict] = {}
TRACK_LIST_CACHE: dict[str, object] = {
    "root": "",
    "expires_at": 0.0,
    "tracks": [],
}
TRACK_LIST_CACHE_TTL_SECONDS = 2.0


def normalize_dir_input(path_text: str) -> Path | None:
    """設定文字列をディレクトリPathへ安全に解決する。"""
    if path_text is None:
        return None

    raw = str(path_text).strip().strip('"').strip("'")
    if not raw:
        return None

    expanded = os.path.expandvars(raw)
    p = Path(expanded).expanduser()

    try:
        resolved = p.resolve()
    except Exception:
        return None

    if not resolved.exists() or not resolved.is_dir():
        return None
    return resolved


def load_music_dir() -> Path:
    """設定ファイルからライブラリフォルダを解決する。"""
    candidate = ""
    if LIBRARY_PATH_FILE.exists():
        try:
            candidate = LIBRARY_PATH_FILE.read_text(encoding="utf-8").strip()
        except Exception:
            candidate = ""

    if candidate:
        resolved = normalize_dir_input(candidate)
        if resolved is not None:
            return resolved

    DEFAULT_MUSIC_DIR.mkdir(parents=True, exist_ok=True)
    return DEFAULT_MUSIC_DIR.resolve()


def save_music_dir(new_dir: Path) -> Path:
    """ライブラリフォルダを保存して反映する。"""
    global MUSIC_DIR
    resolved = normalize_dir_input(str(new_dir))
    if resolved is None:
        raise ValueError("Folder not found")
    LIBRARY_PATH_FILE.write_text(str(resolved), encoding="utf-8")
    MUSIC_DIR = resolved
    invalidate_library_cache()
    return MUSIC_DIR


MUSIC_DIR = load_music_dir()


def resolve_music_path(request_path: str) -> Path | None:
    """music/ 配下のみ許可して安全な実ファイルパスを返す"""
    try:
        filepath = (MUSIC_DIR / request_path).resolve()
        music_root = MUSIC_DIR.resolve()
        filepath.relative_to(music_root)
        if filepath.is_file():
            return filepath
    except Exception:
        return None
    return None


def normalize_music_relative_path(path_value: str) -> str | None:
    """入力パスを music 配下の相対パスへ正規化する。"""
    if not path_value:
        return None

    raw = str(path_value).strip().replace("\\", "/")
    if not raw:
        return None

    # music/ プレフィックスはあってもなくても受け付ける
    if raw.lower().startswith("music/"):
        raw = raw[6:]

    candidate = Path(raw)

    # 絶対パスの場合は music 配下のみ許可
    if candidate.is_absolute():
        try:
            rel = candidate.resolve().relative_to(MUSIC_DIR.resolve())
            return rel.as_posix()
        except Exception:
            return None

    try:
        resolved = (MUSIC_DIR / candidate).resolve()
        rel = resolved.relative_to(MUSIC_DIR.resolve())
        if resolved.is_file() and resolved.suffix.lower() in SUPPORTED_EXTENSIONS:
            return rel.as_posix()
    except Exception:
        return None
    return None


def normalize_music_relative_dir_path(path_value: str) -> str | None:
    """入力パスを music 配下の相対ディレクトリパスへ正規化する。"""
    if not path_value:
        return None

    raw = str(path_value).strip().replace("\\", "/")
    if not raw:
        return None

    if raw.lower().startswith("music/"):
        raw = raw[6:]

    candidate = Path(raw)

    if candidate.is_absolute():
        try:
            rel = candidate.resolve().relative_to(MUSIC_DIR.resolve())
            if candidate.resolve().is_dir():
                return rel.as_posix()
            return None
        except Exception:
            return None

    try:
        resolved = (MUSIC_DIR / candidate).resolve()
        rel = resolved.relative_to(MUSIC_DIR.resolve())
        if resolved.is_dir():
            return rel.as_posix()
    except Exception:
        return None
    return None


def resolve_image_path(request_path: str) -> Path | None:
    """MUSIC_DIR 配下の画像ファイルを安全に解決する。"""
    try:
        filepath = (MUSIC_DIR / request_path).resolve()
        music_root = MUSIC_DIR.resolve()
        filepath.relative_to(music_root)
        if filepath.is_file() and filepath.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            return filepath
    except Exception:
        return None
    return None


def read_image_file_as_art(image_path: Path) -> dict | None:
    try:
        raw = image_path.read_bytes()
        if not raw:
            return None
        mime, _ = mimetypes.guess_type(str(image_path))
        if not mime:
            mime = "image/jpeg"
        return {
            "data": base64.b64encode(raw).decode("utf-8"),
            "mime": mime,
        }
    except Exception:
        return None


def get_folder_sidecar_art(filepath: Path) -> dict | None:
    ext = filepath.suffix.lower()
    if ext not in {".mp3", ".wav"}:
        return None

    try:
        music_root = MUSIC_DIR.resolve()
        current = filepath.parent.resolve()
    except Exception:
        return None

    # 親フォルダへ遡って sidecar を探索し、サブフォルダ配下にも疑似アートを適用する
    while True:
        for filename in SIDECAR_ART_FILENAMES:
            sidecar = current / filename
            if sidecar.exists() and sidecar.is_file():
                art = read_image_file_as_art(sidecar)
                if art:
                    return art

        if current == music_root:
            break

        parent = current.parent
        try:
            parent.relative_to(music_root)
        except Exception:
            break
        current = parent

    return None


def invalidate_library_cache(paths: list[Path] | None = None) -> None:
    TRACK_LIST_CACHE["expires_at"] = 0.0
    if paths:
        for p in paths:
            try:
                TRACK_METADATA_CACHE.pop(str(p.resolve()), None)
            except Exception:
                continue
        return
    TRACK_METADATA_CACHE.clear()


def get_track_metadata_cached(filepath: Path) -> dict:
    try:
        resolved = filepath.resolve()
        key = str(resolved)
        st = resolved.stat()
        stamp = (st.st_mtime_ns, st.st_size)
    except Exception:
        return get_track_metadata(filepath)

    cached = TRACK_METADATA_CACHE.get(key)
    if cached and cached.get("stamp") == stamp:
        return cached["meta"]

    meta = get_track_metadata(resolved)
    TRACK_METADATA_CACHE[key] = {"stamp": stamp, "meta": meta}
    return meta


def _deduplicate_by_quality(tracks: list[dict]) -> list[dict]:
    """同一ゲームフォルダ内で同じステム名を持つトラックが複数の拡張子で存在する場合、
    音質の高い1件のみを残す。グルーピングキーは (stem_lower, top_level_folder)。
    """
    # 品質の高い順（rank昇順）で安定ソート
    ranked = sorted(
        tracks,
        key=lambda t: EXTENSION_QUALITY_RANK.get(Path(t["path"]).suffix.lower(), 99),
    )

    seen: set[tuple[str, str]] = set()
    deduped: list[dict] = []
    for t in ranked:
        p = Path(t["path"])
        stem = p.stem.lower()
        # MUSIC_DIR直下の最上位ディレクトリを「ゲーム」単位として使用
        top = p.parts[0].lower() if len(p.parts) > 1 else ""
        key = (stem, top)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(t)

    # 元の表示順（パス昇順）に戻す
    deduped.sort(key=lambda t: t["path"].lower())
    return deduped


def collect_library_tracks() -> list[dict]:
    if not MUSIC_DIR.exists():
        return []

    now = time.time()
    root = str(MUSIC_DIR.resolve())
    if TRACK_LIST_CACHE.get("root") == root and float(TRACK_LIST_CACHE.get("expires_at", 0.0)) > now:
        return TRACK_LIST_CACHE.get("tracks", [])

    tracks = []
    seen_keys: set[str] = set()
    for f in sorted(MUSIC_DIR.rglob("*"), key=lambda p: p.as_posix().lower()):
        if not f.is_file() or f.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        try:
            seen_keys.add(str(f.resolve()))
        except Exception:
            pass
        tracks.append(get_track_metadata_cached(f))

    stale_keys = [k for k in TRACK_METADATA_CACHE.keys() if k not in seen_keys]
    for key in stale_keys:
        TRACK_METADATA_CACHE.pop(key, None)

    tracks = _deduplicate_by_quality(tracks)

    TRACK_LIST_CACHE["root"] = root
    TRACK_LIST_CACHE["tracks"] = tracks
    TRACK_LIST_CACHE["expires_at"] = now + TRACK_LIST_CACHE_TTL_SECONDS
    return tracks


def parse_playlist_file(file_path: Path) -> list[str]:
    """txt/json プレイリストファイルを解釈して有効な曲パス一覧を返す。"""
    ext = file_path.suffix.lower()
    entries: list[str] = []

    if ext == ".txt":
        for line in file_path.read_text(encoding="utf-8", errors="ignore").splitlines():
            candidate = line.strip()
            if not candidate or candidate.startswith("#") or candidate.startswith("//"):
                continue
            entries.append(candidate)
    elif ext == ".json":
        data = json.loads(file_path.read_text(encoding="utf-8", errors="ignore"))
        if isinstance(data, list):
            entries = [str(v) for v in data if isinstance(v, str)]
        elif isinstance(data, dict):
            values = data.get("tracks") or data.get("paths") or []
            if isinstance(values, list):
                entries = [str(v) for v in values if isinstance(v, str)]

    normalized: list[str] = []
    seen = set()
    for entry in entries:
        normalized_entry = normalize_music_relative_path(entry)
        if normalized_entry and normalized_entry not in seen:
            normalized.append(normalized_entry)
            seen.add(normalized_entry)

    return normalized


def sanitize_playlist_name(name: str) -> str:
    cleaned = []
    for ch in str(name):
        cat = unicodedata.category(ch)
        if cat.startswith("L") or cat.startswith("N") or ch in {" ", "_", "-"}:
            cleaned.append(ch)
    safe = "".join(cleaned).strip()
    safe = re.sub(r"\s+", "_", safe)
    return safe[:64] if safe else "playlist"


def resolve_unique_playlist_file(base_name: str) -> Path:
    candidate = PLAYLIST_DIR / f"{base_name}.json"
    if not candidate.exists():
        return candidate

    for i in range(2, 1000):
        numbered = PLAYLIST_DIR / f"{base_name}_{i}.json"
        if not numbered.exists():
            return numbered

    # 極端な競合時の最終フォールバック
    suffix = hashlib.md5(base_name.encode("utf-8")).hexdigest()[:6]
    return PLAYLIST_DIR / f"{base_name}_{suffix}.json"


def load_playlist_data(file_path: Path) -> dict:
    """プレイリスト定義を読み込む（互換モード対応）。"""
    ext = file_path.suffix.lower()
    data = {"tracks": []}

    if ext == ".txt":
        data["tracks"] = parse_playlist_file(file_path)
        return data

    if ext == ".json":
        raw = json.loads(file_path.read_text(encoding="utf-8", errors="ignore"))
        if isinstance(raw, list):
            data["tracks"] = [p for p in (normalize_music_relative_path(v) for v in raw if isinstance(v, str)) if p]
            return data

        if isinstance(raw, dict):
            tracks_raw = raw.get("tracks")
            if tracks_raw is None:
                tracks_raw = raw.get("paths")
            if not isinstance(tracks_raw, list):
                tracks_raw = []

            data["tracks"] = [p for p in (normalize_music_relative_path(v) for v in tracks_raw if isinstance(v, str)) if p]

    return data


def save_playlist_data(file_path: Path, data: dict) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "tracks": data.get("tracks", []),
    }
    file_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def collect_playlists() -> list[dict]:
    """playlists/ 配下のプレイリスト一覧を返す。"""
    if not PLAYLIST_DIR.exists():
        PLAYLIST_DIR.mkdir(parents=True, exist_ok=True)
        return []

    playlists = []
    for f in sorted(PLAYLIST_DIR.rglob("*"), key=lambda p: p.as_posix().lower()):
        if not f.is_file() or f.suffix.lower() not in SUPPORTED_PLAYLIST_EXTENSIONS:
            continue
        try:
            rel = f.relative_to(PLAYLIST_DIR).as_posix()
            pdata = load_playlist_data(f)
            local_count = len(pdata.get("tracks", []))
            playlists.append(
                {
                    "id": rel,
                    "name": f.stem,
                    "file": rel,
                    "count": local_count,
                }
            )
        except Exception:
            continue
    return playlists


def first_tag_value(tags: dict, key: str, default: str = "") -> str:
    """タグ値を文字列として取り出す。"""
    raw = tags.get(key)
    if not raw:
        return default
    if isinstance(raw, list):
        if not raw:
            return default
        return str(raw[0])
    return str(raw)


def get_technical_info(filepath: Path, audio_obj=None) -> dict:
    """ビットレートやサンプルレートなど技術情報を取得する。"""
    tech = {
        "codec": filepath.suffix.lower().replace(".", "").upper(),
        "bitrateKbps": None,
        "sampleRate": None,
        "channels": None,
        "bitDepth": None,
        "fileSizeMB": round(filepath.stat().st_size / (1024 * 1024), 2),
    }

    try:
        audio = audio_obj if audio_obj is not None else MutagenFile(str(filepath))
        if audio is None or not hasattr(audio, "info") or audio.info is None:
            return tech

        info = audio.info
        bitrate = getattr(info, "bitrate", None)
        if bitrate:
            tech["bitrateKbps"] = int(round(bitrate / 1000))

        sample_rate = getattr(info, "sample_rate", None)
        if sample_rate:
            tech["sampleRate"] = int(sample_rate)

        channels = getattr(info, "channels", None)
        if channels:
            tech["channels"] = int(channels)

        bits_per_sample = getattr(info, "bits_per_sample", None)
        if bits_per_sample:
            tech["bitDepth"] = int(bits_per_sample)
    except Exception:
        pass

    return tech


def update_track_metadata(filepath: Path, payload: dict) -> None:
    """ファイル形式に応じてメタデータを書き込む。"""
    ext = filepath.suffix.lower()

    title = (payload.get("title") or "").strip()
    artist = (payload.get("artist") or "").strip()
    album = (payload.get("album") or "").strip()
    genre = (payload.get("genre") or "").strip()
    year = (payload.get("year") or "").strip()
    track_number = (payload.get("trackNumber") or "").strip()
    disc_number = (payload.get("discNumber") or "").strip()
    album_artist = (payload.get("albumArtist") or "").strip()

    if ext in {".m4a", ".mp4", ".aac", ".alac"}:
        audio = MP4(str(filepath))
        atom_map = {
            "\xa9nam": title,
            "\xa9ART": artist,
            "\xa9alb": album,
            "\xa9gen": genre,
            "\xa9day": year,
            "aART": album_artist,
        }
        for atom, value in atom_map.items():
            if value:
                audio.tags[atom] = [value]
            elif atom in audio.tags:
                del audio.tags[atom]

        if track_number:
            try:
                audio.tags["trkn"] = [(int(track_number), 0)]
            except ValueError:
                pass
        elif "trkn" in audio.tags:
            del audio.tags["trkn"]

        if disc_number:
            try:
                audio.tags["disk"] = [(int(disc_number), 0)]
            except ValueError:
                pass
        elif "disk" in audio.tags:
            del audio.tags["disk"]

        audio.save()
        return

    if ext == ".wma":
        audio = ASF(str(filepath))
        asf_map = {
            "Title": title,
            "Author": artist,
            "WM/AlbumTitle": album,
            "WM/Genre": genre,
            "WM/Year": year,
            "WM/AlbumArtist": album_artist,
            "WM/TrackNumber": track_number,
            "WM/PartOfSet": disc_number,
        }
        for key, value in asf_map.items():
            if value:
                audio.tags[key] = [value]
            elif key in audio.tags:
                del audio.tags[key]
        audio.save()
        return

    # MP3/FLAC/OGG/WAV/AIFFなどは easy tag で共通処理
    audio = MutagenFile(str(filepath), easy=True)
    if audio is None:
        raise ValueError("Unsupported file format")
    if audio.tags is None:
        try:
            audio.add_tags()
        except Exception:
            pass

    easy_map = {
        "title": title,
        "artist": artist,
        "album": album,
        "genre": genre,
        "date": year,
        "tracknumber": track_number,
        "discnumber": disc_number,
        "albumartist": album_artist,
    }

    for key, value in easy_map.items():
        try:
            if value:
                audio[key] = [value]
            elif key in audio:
                del audio[key]
        except Exception:
            # フォーマット側で未対応のタグはスキップ
            continue
    audio.save()


def update_track_artwork(filepath: Path, image_bytes: bytes, mime: str) -> None:
    """フォーマットに応じてアルバムアートを更新する。"""
    ext = filepath.suffix.lower()

    if ext == ".mp3":
        try:
            tags = ID3(str(filepath))
        except Exception:
            tags = ID3()
        tags.delall("APIC")
        tags.add(APIC(encoding=3, mime=mime, type=3, desc="Cover", data=image_bytes))
        tags.save(str(filepath))
        return

    if ext == ".flac":
        audio = FLAC(str(filepath))
        audio.clear_pictures()
        pic = Picture()
        pic.data = image_bytes
        pic.type = 3
        pic.mime = mime
        audio.add_picture(pic)
        audio.save()
        return

    if ext in {".m4a", ".mp4", ".aac", ".alac"}:
        audio = MP4(str(filepath))
        if mime == "image/png":
            cover_format = MP4Cover.FORMAT_PNG
        else:
            cover_format = MP4Cover.FORMAT_JPEG
        audio.tags["covr"] = [MP4Cover(image_bytes, imageformat=cover_format)]
        audio.save()
        return

    raise ValueError("この形式はジャケット更新に未対応です (MP3/FLAC/M4A)")


def get_album_art(filepath: Path) -> dict | None:
    """音楽ファイルからアルバムアートを抽出"""
    try:
        ext = filepath.suffix.lower()
        if ext == ".mp3":
            tags = ID3(str(filepath))
            for tag in tags.values():
                if tag.FrameID == "APIC":
                    return {
                        "data": base64.b64encode(tag.data).decode("utf-8"),
                        "mime": tag.mime,
                    }
        elif ext == ".flac":
            audio = FLAC(str(filepath))
            if audio.pictures:
                pic = audio.pictures[0]
                return {
                    "data": base64.b64encode(pic.data).decode("utf-8"),
                    "mime": pic.mime,
                }
        elif ext in (".m4a", ".aac"):
            audio = MP4(str(filepath))
            if "covr" in audio.tags:
                cover = audio.tags["covr"][0]
                return {
                    "data": base64.b64encode(bytes(cover)).decode("utf-8"),
                    "mime": "image/jpeg",
                }
    except Exception:
        pass
    return None


def get_track_metadata(filepath: Path) -> dict:
    """音楽ファイルからメタデータを取得"""
    metadata = {
        "filename": filepath.name,
        "path": filepath.relative_to(MUSIC_DIR).as_posix(),
        "title": filepath.stem,
        "artist": "Unknown Artist",
        "album": "Unknown Album",
        "albumArtist": "",
        "genre": "",
        "year": "",
        "trackNumber": "",
        "discNumber": "",
        "duration": 0,
        "hasArt": False,
    }

    try:
        audio = MutagenFile(str(filepath))
        if audio is None:
            return metadata

        easy_audio = MutagenFile(str(filepath), easy=True)
        if easy_audio and easy_audio.tags:
            metadata["title"] = first_tag_value(easy_audio.tags, "title", filepath.stem)
            metadata["artist"] = first_tag_value(easy_audio.tags, "artist", "Unknown Artist")
            metadata["album"] = first_tag_value(easy_audio.tags, "album", "Unknown Album")
            metadata["albumArtist"] = first_tag_value(easy_audio.tags, "albumartist", "")
            metadata["genre"] = first_tag_value(easy_audio.tags, "genre", "")
            metadata["year"] = first_tag_value(easy_audio.tags, "date", "")
            metadata["trackNumber"] = first_tag_value(easy_audio.tags, "tracknumber", "")
            metadata["discNumber"] = first_tag_value(easy_audio.tags, "discnumber", "")

        # 再生時間
        if hasattr(audio, "info") and audio.info:
            metadata["duration"] = round(audio.info.length, 2)

        ext = filepath.suffix.lower()

        if ext == ".mp3":
            if audio.tags:
                metadata["title"] = str(audio.tags.get("TIT2", filepath.stem))
                metadata["artist"] = str(audio.tags.get("TPE1", "Unknown Artist"))
                metadata["album"] = str(audio.tags.get("TALB", "Unknown Album"))
        elif ext == ".flac":
            if audio.tags:
                metadata["title"] = audio.tags.get("title", [filepath.stem])[0]
                metadata["artist"] = audio.tags.get("artist", ["Unknown Artist"])[0]
                metadata["album"] = audio.tags.get("album", ["Unknown Album"])[0]
        elif ext == ".ogg":
            if audio.tags:
                metadata["title"] = audio.tags.get("title", [filepath.stem])[0]
                metadata["artist"] = audio.tags.get("artist", ["Unknown Artist"])[0]
                metadata["album"] = audio.tags.get("album", ["Unknown Album"])[0]
        elif ext in (".m4a", ".aac"):
            if audio.tags:
                metadata["title"] = audio.tags.get("\xa9nam", [filepath.stem])[0]
                metadata["artist"] = audio.tags.get("\xa9ART", ["Unknown Artist"])[0]
                metadata["album"] = audio.tags.get("\xa9alb", ["Unknown Album"])[0]

        # M4A/WMA は easy tag で取りづらい項目を補完
        if ext in (".m4a", ".aac", ".mp4", ".alac") and audio.tags:
            metadata["title"] = str(audio.tags.get("\xa9nam", [metadata["title"]])[0])
            metadata["artist"] = str(audio.tags.get("\xa9ART", [metadata["artist"]])[0])
            metadata["album"] = str(audio.tags.get("\xa9alb", [metadata["album"]])[0])
            metadata["albumArtist"] = str(audio.tags.get("aART", [metadata["albumArtist"]])[0])
            metadata["genre"] = str(audio.tags.get("\xa9gen", [metadata["genre"]])[0])
            metadata["year"] = str(audio.tags.get("\xa9day", [metadata["year"]])[0])
            if "trkn" in audio.tags and audio.tags["trkn"]:
                metadata["trackNumber"] = str(audio.tags["trkn"][0][0])
            if "disk" in audio.tags and audio.tags["disk"]:
                metadata["discNumber"] = str(audio.tags["disk"][0][0])

        if ext == ".wma" and audio.tags:
            metadata["title"] = str(audio.tags.get("Title", [metadata["title"]])[0])
            metadata["artist"] = str(audio.tags.get("Author", [metadata["artist"]])[0])
            metadata["album"] = str(audio.tags.get("WM/AlbumTitle", [metadata["album"]])[0])
            metadata["albumArtist"] = str(audio.tags.get("WM/AlbumArtist", [metadata["albumArtist"]])[0])
            metadata["genre"] = str(audio.tags.get("WM/Genre", [metadata["genre"]])[0])
            metadata["year"] = str(audio.tags.get("WM/Year", [metadata["year"]])[0])
            metadata["trackNumber"] = str(audio.tags.get("WM/TrackNumber", [metadata["trackNumber"]])[0])
            metadata["discNumber"] = str(audio.tags.get("WM/PartOfSet", [metadata["discNumber"]])[0])

        # アルバムアートの有無（MP3/WAVはフォルダ画像も疑似アートとして扱う）
        art = get_album_art(filepath)
        if art is None:
            art = get_folder_sidecar_art(filepath)
        metadata["hasArt"] = art is not None

        metadata.update(get_technical_info(filepath, audio))

    except Exception:
        pass

    return metadata


def normalize_name_key(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(name).lower())


def is_soundtrack_title(title: str) -> bool:
    low = str(title or "").lower()
    return any(h in low for h in SOUNDTRACK_HINTS)


def parse_steam_manifest(manifest_path: Path) -> dict | None:
    try:
        text = manifest_path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return None

    appid_match = re.search(r'"appid"\s+"(\d+)"', text)
    name_match = re.search(r'"name"\s+"([^"]+)"', text)
    install_dir_match = re.search(r'"installdir"\s+"([^"]+)"', text)
    if not appid_match:
        return None

    appid = appid_match.group(1)
    title = name_match.group(1).strip() if name_match else f"App {appid}"
    install_dir = install_dir_match.group(1).strip() if install_dir_match else ""
    return {
        "appid": appid,
        "title": title,
        "installDir": install_dir,
        "isSoundtrack": is_soundtrack_title(title),
    }


def parse_steam_libraryfolders(vdf_path: Path) -> list[Path]:
    try:
        text = vdf_path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return []

    paths: list[Path] = []
    for m in re.finditer(r'"path"\s+"([^"]+)"', text):
        raw = m.group(1).replace("\\\\", "\\")
        p = Path(raw).expanduser()
        try:
            resolved = p.resolve()
        except Exception:
            continue
        if (resolved / "steamapps").exists():
            paths.append(resolved)
    return paths


def get_default_steam_roots() -> list[Path]:
    candidates: list[Path] = []
    env_pf86 = os.environ.get("PROGRAMFILES(X86)")
    env_pf = os.environ.get("PROGRAMFILES")
    env_local = os.environ.get("LOCALAPPDATA")

    if env_pf86:
        candidates.append(Path(env_pf86) / "Steam")
    if env_pf:
        candidates.append(Path(env_pf) / "Steam")
    if env_local:
        candidates.append(Path(env_local) / "Steam")

    # Windowsレジストリが使える環境なら SteamPath も参照
    try:
        import winreg

        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam") as key:
            steam_path, _ = winreg.QueryValueEx(key, "SteamPath")
            if steam_path:
                candidates.append(Path(steam_path))
    except Exception:
        pass

    return candidates


def detect_steam_libraries() -> list[Path]:
    libs: dict[str, Path] = {}

    for root in get_default_steam_roots():
        try:
            resolved = root.resolve()
        except Exception:
            continue

        if (resolved / "steamapps").exists():
            libs[str(resolved)] = resolved

        lib_vdf = resolved / "steamapps" / "libraryfolders.vdf"
        for p in parse_steam_libraryfolders(lib_vdf):
            libs[str(p)] = p

    # 現在のMUSIC_DIRがSteam配下ならそのライブラリも候補に含める
    try:
        cur = MUSIC_DIR.resolve()
        marker = "steamapps"
        if marker in [part.lower() for part in cur.parts]:
            idx = [part.lower() for part in cur.parts].index(marker)
            lib = Path(*cur.parts[:idx])
            if (lib / "steamapps").exists():
                libs[str(lib.resolve())] = lib.resolve()
    except Exception:
        pass

    return sorted(libs.values(), key=lambda p: p.as_posix().lower())


def dir_has_audio_files(path: Path) -> bool:
    try:
        for f in path.rglob("*"):
            if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS:
                return True
    except Exception:
        return False
    return False


def collect_steam_apps(libraries: list[Path]) -> list[dict]:
    apps: dict[str, dict] = {}
    for lib in libraries:
        steamapps = lib / "steamapps"
        for manifest in steamapps.glob("appmanifest_*.acf"):
            parsed = parse_steam_manifest(manifest)
            if not parsed:
                continue
            appid = parsed["appid"]
            if appid not in apps:
                apps[appid] = parsed
    return sorted(apps.values(), key=lambda a: a["title"].lower())


def collect_steam_music_candidates(libraries: list[Path], apps: list[dict]) -> list[dict]:
    app_name_map = {normalize_name_key(a["title"]): a for a in apps}
    install_dir_map = {
        normalize_name_key(a.get("installDir", "")): a
        for a in apps
        if a.get("installDir")
    }
    soundtrack_apps = [a for a in apps if a.get("isSoundtrack")]

    def pick_soundtrack_app(game_name: str):
        gk = normalize_name_key(game_name)
        if not gk:
            return None
        related = [a for a in soundtrack_apps if gk in normalize_name_key(a.get("title", ""))]
        if not related:
            return None
        return min(related, key=lambda a: len(str(a.get("title", ""))))

    seen: set[str] = set()
    candidates: list[dict] = []

    for lib in libraries:
        steamapps = lib / "steamapps"

        direct_music = steamapps / "music"
        if direct_music.exists() and direct_music.is_dir() and dir_has_audio_files(direct_music):
            k = str(direct_music.resolve())
            if k not in seen:
                seen.add(k)
                candidates.append(
                    {
                        "path": k,
                        "label": f"{lib.name} / steamapps/music",
                        "type": "steamapps-music",
                    }
                )

        common = steamapps / "common"
        if not common.exists() or not common.is_dir():
            continue

        for game_dir in common.iterdir():
            if not game_dir.is_dir():
                continue
            game_name = game_dir.name
            exact_app = install_dir_map.get(normalize_name_key(game_name))
            matched_app = exact_app or app_name_map.get(normalize_name_key(game_name))
            soundtrack_app = None
            if exact_app and exact_app.get("isSoundtrack"):
                soundtrack_app = exact_app
            else:
                soundtrack_app = pick_soundtrack_app(game_name)

            sub_candidates = []
            try:
                sub_candidates = [d for d in game_dir.rglob("*") if d.is_dir() and any(t in d.name.lower() for t in ("soundtrack", "ost", "music"))]
            except Exception:
                sub_candidates = []

            if any(t in game_name.lower() for t in ("soundtrack", "ost")):
                sub_candidates.insert(0, game_dir)

            # 過剰探索を避ける
            for d in sub_candidates[:20]:
                if not dir_has_audio_files(d):
                    continue
                try:
                    resolved = d.resolve()
                except Exception:
                    continue
                k = str(resolved)
                if k in seen:
                    continue
                seen.add(k)
                row = {
                    "path": k,
                    "label": str(resolved.relative_to(lib)).replace("\\", "/"),
                    "type": "game-subdir",
                }
                selected_app = soundtrack_app or matched_app
                if selected_app:
                    row["appid"] = selected_app["appid"]
                    row["gameTitle"] = selected_app["title"]
                    row["isSoundtrackApp"] = bool(selected_app.get("isSoundtrack"))
                candidates.append(row)

    return sorted(candidates, key=lambda c: c["path"].lower())


def fetch_steam_capsule_image(appid: str) -> tuple[bytes, str] | None:
    appid = str(appid or "").strip()
    if not re.fullmatch(r"\d+", appid):
        return None

    base_names = [
        # Library assets (Steamクライアントのライブラリ表示で使われる主要アセット)
        "library_600x900_2x",
        "library_600x900",
        "library_hero",
        "library_hero_blur",
        "library_header",
        "library_logo",
        # Store/legacy capsule assets
        "capsule_616x353",
        "capsule_467x181",
        "capsule_231x87",
        "header",
        "hero_capsule",
        "main_capsule",
        "logo",
    ]
    exts = ["jpg", "png", "webp"]
    urls = [
        f"https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/{name}.{ext}"
        for name in base_names
        for ext in exts
    ]

    for url in urls:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "musicplayer/1.0"})
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = resp.read()
                if data:
                    mime = resp.headers.get_content_type() if resp.headers else ""
                    if mime not in {"image/jpeg", "image/png", "image/webp"}:
                        if url.endswith(".png"):
                            mime = "image/png"
                        elif url.endswith(".webp"):
                            mime = "image/webp"
                        else:
                            mime = "image/jpeg"
                    return data, mime
        except (urllib.error.URLError, TimeoutError, ValueError):
            continue
        except Exception:
            continue
    return None


def get_external_track_preview(filepath: Path, root_dir: Path) -> dict:
    """MUSIC_DIR外の候補フォルダ用に軽量なトラック情報を返す。"""
    preview = {
        "title": filepath.stem,
        "duration": 0,
        "path": filepath.name,
    }

    try:
        preview["path"] = filepath.relative_to(root_dir).as_posix()
    except Exception:
        preview["path"] = filepath.name

    try:
        audio = MutagenFile(str(filepath), easy=True)
        if audio and audio.tags:
            title = first_tag_value(audio.tags, "title", filepath.stem)
            preview["title"] = title or filepath.stem

        audio_raw = MutagenFile(str(filepath))
        if audio_raw and hasattr(audio_raw, "info") and audio_raw.info and getattr(audio_raw.info, "length", None):
            preview["duration"] = round(float(audio_raw.info.length), 2)
    except Exception:
        pass

    return preview


@app.route("/")
def index():
    return send_from_directory("templates", "index.html")


@app.route("/editor")
def editor_page():
    return redirect('/')


@app.route("/playlists")
@app.route("/playlists/")
@app.route("/playlist")
@app.route("/playlist/")
@app.route("/playlists.html")
def playlists_page():
    return send_from_directory("templates", "playlists.html")


@app.route("/static/<path:filename>")
def serve_static(filename):
    return send_from_directory("static", filename)


@app.route("/api/tracks")
def get_tracks():
    """music/ フォルダ内の全トラックを返す"""
    if not MUSIC_DIR.exists():
        MUSIC_DIR.mkdir(parents=True, exist_ok=True)
        return jsonify([])

    return jsonify(collect_library_tracks())


@app.route("/api/library/path")
def get_library_path():
    return jsonify(
        {
            "path": str(MUSIC_DIR),
            "defaultPath": str(DEFAULT_MUSIC_DIR.resolve()),
            "usingDefault": MUSIC_DIR.resolve() == DEFAULT_MUSIC_DIR.resolve(),
        }
    )


@app.route("/api/library/path", methods=["POST"])
def set_library_path():
    body = request.get_json(silent=True) or {}
    raw = str(body.get("path") or "").strip()
    if not raw:
        return jsonify({"ok": False, "error": "path is required"}), 400

    try:
        updated = save_music_dir(Path(raw))
        return jsonify({"ok": True, "path": str(updated)})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 400


@app.route("/api/library/folders")
def list_library_folders():
    """ライブラリパス直下のフォルダ一覧を返す。"""
    try:
        root = MUSIC_DIR.resolve()

        if not root.exists() or not root.is_dir():
            return jsonify({"ok": True, "folders": []})

        image_exts = {".jpg", ".jpeg", ".png", ".webp"}

        def pick_preview_image(folder: Path) -> str:
            for name in SIDECAR_ART_FILENAMES:
                candidate = folder / name
                if candidate.is_file():
                    try:
                        return candidate.relative_to(root).as_posix()
                    except Exception:
                        pass

            for f in sorted(folder.rglob("*"), key=lambda p: p.as_posix().lower()):
                if f.is_file() and f.suffix.lower() in image_exts:
                    try:
                        return f.relative_to(root).as_posix()
                    except Exception:
                        continue
            return ""

        folders = []
        for child in sorted(root.iterdir(), key=lambda p: p.name.lower()):
            if not child.is_dir():
                continue
            folders.append(
                {
                    "path": child.name,
                    "name": child.name,
                    "previewImage": pick_preview_image(child),
                }
            )

        return jsonify({"ok": True, "folders": folders})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 500


@app.route("/api/steam/candidates")
def get_steam_candidates():
    libraries = detect_steam_libraries()
    apps = collect_steam_apps(libraries)
    candidates = collect_steam_music_candidates(libraries, apps)
    soundtrack_apps = [
        {
            "appid": a.get("appid"),
            "title": a.get("title"),
            "installDir": a.get("installDir", ""),
        }
        for a in apps
        if a.get("isSoundtrack")
    ]

    if not soundtrack_apps:
        # サウンドトラック判定に引っかからない環境向けフォールバック
        from_candidates = {}
        for c in candidates:
            if c.get("appid") and c.get("gameTitle"):
                from_candidates[c["appid"]] = {
                    "appid": c["appid"],
                    "title": c["gameTitle"],
                    "installDir": "",
                }
        soundtrack_apps = list(from_candidates.values())

    return jsonify(
        {
            "ok": True,
            "libraries": [str(p) for p in libraries],
            "apps": apps,
            "soundtrackApps": soundtrack_apps,
            "candidates": candidates,
        }
    )


@app.route("/api/steam/cover/<appid>")
def get_steam_cover(appid):
    art = fetch_steam_capsule_image(appid)
    if art is not None:
        data, mime = art
        return Response(data, mimetype=mime, headers={"Cache-Control": "public, max-age=86400"})

    safe_id = re.sub(r"[^0-9]", "", str(appid or "")) or "N/A"
    svg = f"""<svg xmlns='http://www.w3.org/2000/svg' width='600' height='900'>
<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#1b2432'/><stop offset='1' stop-color='#0f141d'/></linearGradient></defs>
<rect width='100%' height='100%' fill='url(#g)'/>
<text x='50%' y='46%' dominant-baseline='middle' text-anchor='middle' fill='#c8d2e8' font-size='42' font-family='Segoe UI, Arial'>No Cover</text>
<text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='#97a6c4' font-size='28' font-family='Segoe UI, Arial'>AppID {safe_id}</text>
</svg>"""
    return Response(svg, mimetype="image/svg+xml")


@app.route("/api/steam/folder-tracks", methods=["POST"])
def get_steam_folder_tracks():
    body = request.get_json(silent=True) or {}
    folder_raw = str(body.get("folder") or "").strip()
    if not folder_raw:
        return jsonify({"ok": False, "error": "folder is required"}), 400

    folder = normalize_dir_input(folder_raw)
    if folder is None:
        return jsonify({"ok": False, "error": "folder not found"}), 404

    libs = detect_steam_libraries()
    apps = collect_steam_apps(libs)
    candidates = collect_steam_music_candidates(libs, apps)
    allowed = {str(Path(c.get("path", "")).resolve()) for c in candidates if c.get("path")}

    try:
        folder_resolved = folder.resolve()
    except Exception:
        return jsonify({"ok": False, "error": "folder resolve failed"}), 400

    if str(folder_resolved) not in allowed:
        return jsonify({"ok": False, "error": "folder is not a steam candidate"}), 400

    tracks = []
    for f in sorted(folder_resolved.rglob("*"), key=lambda p: p.as_posix().lower()):
        if not f.is_file() or f.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        tracks.append(get_external_track_preview(f, folder_resolved))
        if len(tracks) >= 500:
            break

    return jsonify({"ok": True, "folder": str(folder_resolved), "tracks": tracks})


@app.route("/api/editor/tracks")
def get_editor_tracks():
    """編集ページ向けに詳細つきトラック一覧を返す。"""
    if not MUSIC_DIR.exists():
        return jsonify([])

    return jsonify(collect_library_tracks())


@app.route("/api/playlists")
def get_playlists():
    return jsonify(collect_playlists())


@app.route("/api/playlists/<path:playlist_id>")
def get_playlist_tracks(playlist_id):
    try:
        playlist_file = (PLAYLIST_DIR / playlist_id).resolve()
        playlist_file.relative_to(PLAYLIST_DIR.resolve())
    except Exception:
        return jsonify({"error": "Playlist not found"}), 404

    if not playlist_file.exists() or not playlist_file.is_file():
        return jsonify({"error": "Playlist not found"}), 404
    if playlist_file.suffix.lower() not in SUPPORTED_PLAYLIST_EXTENSIONS:
        return jsonify({"error": "Unsupported playlist format"}), 400

    try:
        pdata = load_playlist_data(playlist_file)
        tracks = []
        for rel in pdata.get("tracks", []):
            resolved = resolve_music_path(rel)
            if resolved is None:
                continue
            tracks.append(get_track_metadata(resolved))

        return jsonify(
            {
                "id": playlist_id,
                "name": playlist_file.stem,
                "tracks": tracks,
            }
        )
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


@app.route("/api/playlists/<path:playlist_id>/raw")
def get_playlist_raw(playlist_id):
    try:
        playlist_file = (PLAYLIST_DIR / playlist_id).resolve()
        playlist_file.relative_to(PLAYLIST_DIR.resolve())
    except Exception:
        return jsonify({"ok": False, "error": "Playlist not found"}), 404

    if not playlist_file.exists() or not playlist_file.is_file() or playlist_file.suffix.lower() != ".json":
        return jsonify({"ok": False, "error": "JSON playlist only"}), 400

    data = load_playlist_data(playlist_file)
    return jsonify(
        {
            "ok": True,
            "playlist": {
                "id": playlist_id,
                "name": playlist_file.stem,
                "tracks": data.get("tracks", []),
            },
        }
    )


@app.route("/api/playlists/create", methods=["POST"])
def create_playlist():
    body = request.get_json(silent=True) or {}
    name = str(body.get("name") or "").strip()
    tracks = body.get("tracks") or []

    if not name:
        return jsonify({"ok": False, "error": "Playlist name is required"}), 400

    safe_name = sanitize_playlist_name(name)
    playlist_file = resolve_unique_playlist_file(safe_name)

    valid_tracks = []
    if isinstance(tracks, list):
        for item in tracks:
            if isinstance(item, dict):
                rel = normalize_music_relative_path(item.get("path", ""))
            else:
                rel = normalize_music_relative_path(str(item))
            if rel and rel not in valid_tracks:
                valid_tracks.append(rel)

    save_playlist_data(playlist_file, {"tracks": valid_tracks})

    rel = playlist_file.relative_to(PLAYLIST_DIR).as_posix()
    return jsonify({"ok": True, "playlist": {"id": rel, "name": playlist_file.stem, "count": len(valid_tracks)}})


@app.route("/api/playlists/add-tracks", methods=["POST"])
def add_tracks_to_playlist():
    body = request.get_json(silent=True) or {}
    playlist_id = str(body.get("playlistId") or "").strip()
    tracks = body.get("tracks") or []

    if not playlist_id:
        return jsonify({"ok": False, "error": "playlistId is required"}), 400

    try:
        playlist_file = (PLAYLIST_DIR / playlist_id).resolve()
        playlist_file.relative_to(PLAYLIST_DIR.resolve())
    except Exception:
        return jsonify({"ok": False, "error": "Playlist not found"}), 404

    if not playlist_file.exists() or playlist_file.suffix.lower() != ".json":
        return jsonify({"ok": False, "error": "JSON playlist only"}), 400

    pdata = load_playlist_data(playlist_file)
    existing = set(pdata.get("tracks", []))

    for item in tracks:
        if isinstance(item, dict):
            rel = normalize_music_relative_path(item.get("path", ""))
        else:
            rel = normalize_music_relative_path(str(item))
        if rel:
            existing.add(rel)

    pdata["tracks"] = sorted(existing)
    save_playlist_data(playlist_file, pdata)
    return jsonify({"ok": True, "count": len(pdata["tracks"])})


@app.route("/api/playlists/save", methods=["POST"])
def save_playlist_full():
    body = request.get_json(silent=True) or {}
    playlist_id = str(body.get("playlistId") or "").strip()
    tracks = body.get("tracks") or []

    if not playlist_id:
        return jsonify({"ok": False, "error": "playlistId is required"}), 400

    try:
        playlist_file = (PLAYLIST_DIR / playlist_id).resolve()
        playlist_file.relative_to(PLAYLIST_DIR.resolve())
    except Exception:
        return jsonify({"ok": False, "error": "Playlist not found"}), 404

    if not playlist_file.exists() or playlist_file.suffix.lower() != ".json":
        return jsonify({"ok": False, "error": "JSON playlist only"}), 400

    normalized_tracks = []
    if isinstance(tracks, list):
        for item in tracks:
            rel = normalize_music_relative_path(str(item))
            if rel and rel not in normalized_tracks:
                normalized_tracks.append(rel)

    save_playlist_data(playlist_file, {"tracks": normalized_tracks})
    return jsonify({"ok": True, "count": len(normalized_tracks)})


@app.route("/api/playlists/<path:playlist_id>", methods=["DELETE"])
def delete_playlist(playlist_id):
    try:
        playlist_file = (PLAYLIST_DIR / playlist_id).resolve()
        playlist_file.relative_to(PLAYLIST_DIR.resolve())
    except Exception:
        return jsonify({"ok": False, "error": "Playlist not found"}), 404

    if not playlist_file.exists() or not playlist_file.is_file() or playlist_file.suffix.lower() != ".json":
        return jsonify({"ok": False, "error": "JSON playlist only"}), 400

    playlist_file.unlink(missing_ok=True)
    return jsonify({"ok": True})


@app.route("/api/editor/track/<path:filepath>")
def get_editor_track(filepath):
    resolved = resolve_music_path(filepath)
    if resolved is None:
        return jsonify({"error": "File not found"}), 404
    return jsonify(get_track_metadata_cached(resolved))


@app.route("/api/editor/update", methods=["POST"])
def update_editor_track():
    body = request.get_json(silent=True) or {}
    file_path = body.get("path", "")
    tags = body.get("tags", {})

    resolved = resolve_music_path(file_path)
    if resolved is None:
        return jsonify({"ok": False, "error": "File not found"}), 404

    try:
        update_track_metadata(resolved, tags)
        invalidate_library_cache([resolved])
        updated = get_track_metadata_cached(resolved)
        return jsonify({"ok": True, "track": updated})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 400


@app.route("/api/editor/bulk-update", methods=["POST"])
def bulk_update_editor_tracks():
    body = request.get_json(silent=True) or {}
    paths = body.get("paths") or []
    tags = body.get("tags") or {}

    if not paths or not isinstance(paths, list):
        return jsonify({"ok": False, "error": "paths is required"}), 400

    results = []
    changed_paths: list[Path] = []
    for p in paths:
        resolved = resolve_music_path(p)
        if resolved is None:
            results.append({"path": p, "ok": False, "error": "not found"})
            continue
        try:
            update_track_metadata(resolved, tags)
            changed_paths.append(resolved)
            results.append({"path": p, "ok": True})
        except Exception as exc:
            results.append({"path": p, "ok": False, "error": str(exc)})

    if changed_paths:
        invalidate_library_cache(changed_paths)

    return jsonify({"ok": True, "results": results})


@app.route("/api/editor/folder-bulk-update", methods=["POST"])
def folder_bulk_update_editor_tracks():
    body = request.get_json(silent=True) or {}
    folder_raw = str(body.get("folder") or "").strip()
    tags = body.get("tags") or {}
    include_subfolders = bool(body.get("includeSubfolders", True))

    if not folder_raw:
        return jsonify({"ok": False, "error": "folder is required"}), 400

    rel_folder = normalize_music_relative_dir_path(folder_raw)
    if rel_folder is None:
        return jsonify({"ok": False, "error": "folder not found"}), 404

    allowed_keys = {"artist", "album", "albumArtist", "genre", "year", "discNumber"}
    safe_tags = {}
    for key, value in (tags.items() if isinstance(tags, dict) else []):
        if key in allowed_keys:
            v = str(value or "").strip()
            if v:
                safe_tags[key] = v

    if not safe_tags:
        return jsonify({"ok": False, "error": "at least one tag is required"}), 400

    folder_path = (MUSIC_DIR / rel_folder).resolve()
    iterator = folder_path.rglob("*") if include_subfolders else folder_path.glob("*")

    targets: list[Path] = []
    for f in iterator:
        if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS:
            targets.append(f)

    if not targets:
        return jsonify({"ok": False, "error": "no tracks found in folder"}), 404

    results = []
    changed_paths: list[Path] = []
    for f in targets:
        try:
            rel = f.relative_to(MUSIC_DIR.resolve()).as_posix()
        except Exception:
            continue
        try:
            update_track_metadata(f, safe_tags)
            changed_paths.append(f)
            results.append({"path": rel, "ok": True})
        except Exception as exc:
            results.append({"path": rel, "ok": False, "error": str(exc)})

    if changed_paths:
        invalidate_library_cache(changed_paths)

    ok_count = sum(1 for r in results if r.get("ok"))
    fail_count = len(results) - ok_count
    return jsonify(
        {
            "ok": True,
            "folder": rel_folder,
            "includeSubfolders": include_subfolders,
            "results": results,
            "updated": ok_count,
            "failed": fail_count,
        }
    )


@app.route("/api/editor/organize", methods=["POST"])
def organize_editor_tracks():
    """メタデータに基づいてファイルを整理フォルダへ移動する。"""
    body = request.get_json(silent=True) or {}
    paths = body.get("paths") or []
    dry_run = body.get("dryRun", False)
    preset = str(body.get("preset") or "default").strip().lower()
    steam_game_title = str(body.get("steamGameTitle") or "").strip()
    steam_app_id = str(body.get("steamAppId") or "").strip()

    if not paths or not isinstance(paths, list):
        return jsonify({"ok": False, "error": "paths is required"}), 400

    if preset == "steam" and not steam_game_title:
        return jsonify({"ok": False, "error": "steamGameTitle is required for steam preset"}), 400

    moves = []
    changed_paths: list[Path] = []

    def safe_name(s):
        return re.sub(r'[<>:"/\\|?*]', '_', s).strip().rstrip('.')

    for rel_path in paths:
        resolved = resolve_music_path(rel_path)
        if resolved is None:
            moves.append({"from": rel_path, "to": None, "error": "not found"})
            continue

        meta = get_track_metadata(resolved)
        album_artist = (meta.get("albumArtist") or meta.get("artist") or "Unknown Artist").strip()
        album = (meta.get("album") or "Unknown Album").strip()

        safe_artist = safe_name(album_artist)
        safe_album = safe_name(album)

        # ファイル名構築: DiscNum-TrackNum Title.ext
        parts = []
        disc = meta.get("discNumber", "").strip()
        track_num = meta.get("trackNumber", "").strip()
        # trackNumber が "3/12" 形式の場合の処理
        if "/" in track_num:
            track_num = track_num.split("/")[0].strip()
        if disc and disc not in ("0", "1"):
            parts.append(f"{int(disc):01d}-")
        if track_num:
            try:
                parts.append(f"{int(track_num):02d} ")
            except ValueError:
                parts.append(f"{track_num} ")
        title = (meta.get("title") or resolved.stem).strip()
        parts.append(safe_name(title))
        new_filename = "".join(parts) + resolved.suffix.lower()

        target_dir = MUSIC_DIR / safe_artist / safe_album

        if preset == "steam":
            steam_label = steam_game_title
            if steam_app_id:
                steam_label = f"{steam_game_title} ({steam_app_id})"
            safe_game = safe_name(steam_label)

            disc_num = 1
            try:
                disc_num = int((meta.get("discNumber") or "1").split("/")[0].strip())
            except Exception:
                disc_num = 1

            track_num = 0
            try:
                raw_track = (meta.get("trackNumber") or "0").split("/")[0].strip()
                track_num = int(raw_track)
            except Exception:
                track_num = 0

            steam_title = safe_name(meta.get("title") or resolved.stem)
            new_filename = f"{disc_num:02d}-{track_num:02d} {steam_title}{resolved.suffix.lower()}"
            target_dir = MUSIC_DIR / safe_game / "Soundtrack"

        target_path = target_dir / new_filename
        new_rel = target_path.relative_to(MUSIC_DIR).as_posix()

        if resolved == target_path.resolve():
            moves.append({"from": rel_path, "to": new_rel, "skipped": True})
            continue

        if not dry_run:
            target_dir.mkdir(parents=True, exist_ok=True)
            # 移動先に同名ファイルがある場合はスキップ
            if target_path.exists():
                moves.append({"from": rel_path, "to": new_rel, "error": "target exists"})
                continue
            resolved.rename(target_path)
            changed_paths.extend([resolved, target_path])

            # プレイリスト内のパス参照も更新
            _update_playlist_references(rel_path, new_rel)

        moves.append({"from": rel_path, "to": new_rel})

    if changed_paths:
        invalidate_library_cache(changed_paths)

    return jsonify({"ok": True, "moves": moves, "dryRun": dry_run})


def _update_playlist_references(old_rel: str, new_rel: str) -> None:
    """全プレイリスト内の曲パス参照を更新する。"""
    if not PLAYLIST_DIR.exists():
        return
    for f in PLAYLIST_DIR.rglob("*.json"):
        try:
            raw = json.loads(f.read_text(encoding="utf-8"))
            if not isinstance(raw, dict):
                continue
            tracks = raw.get("tracks", [])
            if old_rel in tracks:
                raw["tracks"] = [new_rel if t == old_rel else t for t in tracks]
                f.write_text(json.dumps(raw, ensure_ascii=False, indent=2), encoding="utf-8")
        except Exception:
            continue


@app.route("/api/editor/steam-capsule", methods=["POST"])
def apply_steam_capsule_to_album():
    body = request.get_json(silent=True) or {}
    app_id = str(body.get("appId") or "").strip()
    folder = str(body.get("folder") or "").strip()

    if not app_id:
        return jsonify({"ok": False, "error": "appId is required"}), 400
    if not folder:
        return jsonify({"ok": False, "error": "folder is required"}), 400

    normalized_folder = normalize_music_relative_dir_path(folder)
    if normalized_folder is None:
        return jsonify({"ok": False, "error": "folder not found"}), 404

    folder_path = (MUSIC_DIR / normalized_folder).resolve()

    capsule = fetch_steam_capsule_image(app_id)
    if capsule is None:
        return jsonify({"ok": False, "error": "Steam capsule image not found"}), 400

    image_bytes, mime = capsule

    # 対象トラック抽出（指定フォルダ配下の MP3/WAV）
    target_files: list[Path] = []

    for f in folder_path.rglob("*"):
        if not f.is_file():
            continue
        if f.suffix.lower() not in {".mp3", ".wav"}:
            continue
        target_files.append(f)

    # 重複排除
    uniq: dict[str, Path] = {}
    for f in target_files:
        uniq[str(f.resolve())] = f
    target_files = list(uniq.values())

    if not target_files:
        return jsonify({"ok": False, "error": "no mp3/wav tracks found in folder"}), 404

    eligible_count = 0
    for f in target_files:
        ext = f.suffix.lower()
        if ext == ".wav":
            eligible_count += 1
            continue
        if ext == ".mp3" and get_album_art(f) is None:
            eligible_count += 1

    if eligible_count == 0:
        return jsonify({"ok": False, "error": "no eligible tracks (only MP3 without art or WAV are allowed)"}), 400

    sidecar_path = folder_path / "soundtrack_capsule.jpg"
    sidecar_path.write_bytes(image_bytes)

    results = []
    for f in target_files:
        ext = f.suffix.lower()
        rel = f.relative_to(MUSIC_DIR).as_posix()
        try:
            if ext == ".wav":
                results.append({"path": rel, "ok": True, "mode": "sidecar-visible"})
                continue

            if ext == ".mp3":
                if get_album_art(f) is not None:
                    results.append({"path": rel, "ok": True, "mode": "skipped-has-art"})
                    continue
                results.append({"path": rel, "ok": True, "mode": "sidecar-visible"})
                continue

            results.append({"path": rel, "ok": True, "mode": "skipped-unsupported"})
        except Exception as exc:
            results.append({"path": rel, "ok": False, "error": str(exc)})

    invalidate_library_cache()

    return jsonify(
        {
            "ok": True,
            "results": results,
            "folder": normalized_folder,
            "appId": app_id,
            "savedImage": sidecar_path.name,
            "eligible": eligible_count,
            "mime": mime,
        }
    )


@app.route("/api/editor/folder-images", methods=["POST"])
def list_folder_images():
    body = request.get_json(silent=True) or {}
    folder_raw = str(body.get("folder") or "").strip()
    if not folder_raw:
        return jsonify({"ok": False, "error": "folder is required"}), 400

    rel_folder = normalize_music_relative_dir_path(folder_raw)
    if rel_folder is None:
        return jsonify({"ok": False, "error": "folder not found"}), 404

    base_dir = (MUSIC_DIR / rel_folder).resolve()
    images = []
    for f in sorted(base_dir.rglob("*"), key=lambda p: p.as_posix().lower()):
        if not f.is_file() or f.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        try:
            rel = f.relative_to(MUSIC_DIR.resolve()).as_posix()
        except Exception:
            continue
        images.append(
            {
                "path": rel,
                "name": f.name,
                "folder": f.parent.relative_to(MUSIC_DIR.resolve()).as_posix(),
            }
        )

    return jsonify({"ok": True, "folder": rel_folder, "images": images})


@app.route("/api/editor/image/<path:image_path>")
def serve_editor_image(image_path):
    resolved = resolve_image_path(image_path)
    if resolved is None:
        return "", 404
    mime_type, _ = mimetypes.guess_type(str(resolved))
    return send_file(resolved, mimetype=mime_type or "image/jpeg")


@app.route("/api/editor/folder-image/upload", methods=["POST"])
def upload_folder_image():
    folder_raw = str(request.form.get("folder") or "").strip()
    if not folder_raw:
        return jsonify({"ok": False, "error": "folder is required"}), 400

    rel_folder = normalize_music_relative_dir_path(folder_raw)
    if rel_folder is None:
        return jsonify({"ok": False, "error": "folder not found"}), 404

    uploaded = request.files.get("image")
    if uploaded is None or not uploaded.filename:
        return jsonify({"ok": False, "error": "image file is required"}), 400

    folder_path = (MUSIC_DIR / rel_folder).resolve()
    ext = Path(uploaded.filename).suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        mime = (uploaded.mimetype or "").lower()
        if mime == "image/png":
            ext = ".png"
        elif mime == "image/webp":
            ext = ".webp"
        else:
            ext = ".jpg"

    stem = Path(uploaded.filename).stem.strip() or "uploaded_image"
    safe_stem = re.sub(r"[^A-Za-z0-9._-]+", "_", stem).strip("._") or "uploaded_image"

    target = folder_path / f"{safe_stem}{ext}"
    i = 1
    while target.exists():
        target = folder_path / f"{safe_stem}_{i}{ext}"
        i += 1

    try:
        uploaded.save(str(target))
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 500

    rel = target.relative_to(MUSIC_DIR.resolve()).as_posix()
    return jsonify(
        {
            "ok": True,
            "folder": rel_folder,
            "image": {
                "path": rel,
                "name": target.name,
                "folder": target.parent.relative_to(MUSIC_DIR.resolve()).as_posix(),
            },
        }
    )


@app.route("/api/editor/folder-image/apply", methods=["POST"])
def apply_folder_image_sidecar():
    body = request.get_json(silent=True) or {}
    folder_raw = str(body.get("folder") or "").strip()
    image_path_raw = str(body.get("imagePath") or "").strip()
    steam_app_id = str(body.get("steamAppId") or "").strip()

    if not folder_raw:
        return jsonify({"ok": False, "error": "folder is required"}), 400
    if not image_path_raw and not steam_app_id:
        return jsonify({"ok": False, "error": "imagePath or steamAppId is required"}), 400

    rel_folder = normalize_music_relative_dir_path(folder_raw)
    if rel_folder is None:
        return jsonify({"ok": False, "error": "folder not found"}), 404

    folder_path = (MUSIC_DIR / rel_folder).resolve()
    source_image = ""
    if steam_app_id:
        art = fetch_steam_capsule_image(steam_app_id)
        if art is None:
            return jsonify({"ok": False, "error": "steam capsule image not found"}), 404
        data, _ = art
        ext = ".jpg"
        source_image = f"steam:{steam_app_id}"
    else:
        selected_image = resolve_image_path(image_path_raw)
        if selected_image is None:
            return jsonify({"ok": False, "error": "image file not found"}), 404

        try:
            selected_image.relative_to(folder_path)
        except Exception:
            return jsonify({"ok": False, "error": "selected image is outside target folder"}), 400

        data = selected_image.read_bytes()
        ext = selected_image.suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png"}:
            ext = ".jpg"
        source_image = selected_image.relative_to(MUSIC_DIR.resolve()).as_posix()

    sidecar_name = f"soundtrack_capsule{ext}"
    sidecar_path = folder_path / sidecar_name
    sidecar_path.write_bytes(data)

    eligible = 0
    for f in folder_path.rglob("*"):
        if not f.is_file():
            continue
        if f.suffix.lower() == ".wav":
            eligible += 1
            continue
        if f.suffix.lower() == ".mp3" and get_album_art(f) is None:
            eligible += 1

    invalidate_library_cache()

    return jsonify(
        {
            "ok": True,
            "folder": rel_folder,
            "savedImage": sidecar_name,
            "sourceImage": source_image,
            "eligible": eligible,
        }
    )


@app.route("/api/editor/artwork", methods=["POST"])
def update_editor_artwork():
    body = request.get_json(silent=True) or {}
    file_path = body.get("path", "")
    data_url = body.get("imageData", "")

    resolved = resolve_music_path(file_path)
    if resolved is None:
        return jsonify({"ok": False, "error": "File not found"}), 404

    if not isinstance(data_url, str) or not data_url.startswith("data:image/"):
        return jsonify({"ok": False, "error": "Invalid image data"}), 400

    try:
        header, b64 = data_url.split(",", 1)
        mime = header.split(";")[0].replace("data:", "")
        if mime not in {"image/jpeg", "image/png", "image/jpg"}:
            return jsonify({"ok": False, "error": "JPEG/PNG のみ対応です"}), 400
        image_bytes = base64.b64decode(b64)
        update_track_artwork(resolved, image_bytes, "image/jpeg" if mime == "image/jpg" else mime)
        invalidate_library_cache([resolved])
        updated = get_track_metadata_cached(resolved)
        return jsonify({"ok": True, "track": updated})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 400


@app.route("/api/art/<path:filepath>")
def get_art(filepath):
    """アルバムアートを返す"""
    resolved = resolve_music_path(filepath)
    if resolved is None:
        return "", 404

    art = get_album_art(resolved)
    if art is None:
        art = get_folder_sidecar_art(resolved)
    if art:
        return jsonify(art)
    return "", 404


@app.route("/music/<path:filepath>")
def serve_music(filepath):
    """音楽ファイルを配信。ブラウザ非対応フォーマットはFFmpegでOgg Opusにリアルタイムトランスコード。"""
    resolved = resolve_music_path(filepath)
    if resolved is None:
        return "", 404

    ext = resolved.suffix.lower()

    if ext in TRANSCODE_EXTENSIONS:
        # FFmpegがなければ501を返す
        if shutil.which("ffmpeg") is None:
            return "FFmpeg not found", 501

        def generate_transcoded():
            proc = subprocess.Popen(
                [
                    "ffmpeg", "-y",
                    "-i", str(resolved),
                    "-vn",
                    "-c:a", "libopus",
                    "-b:a", "192k",
                    "-f", "ogg",
                    "pipe:1",
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
            )
            try:
                while True:
                    chunk = proc.stdout.read(65536)
                    if not chunk:
                        break
                    yield chunk
            finally:
                proc.stdout.close()
                proc.wait()

        return Response(generate_transcoded(), mimetype="audio/ogg")

    mime_type = AUDIO_MIME_TYPES.get(ext)
    if mime_type is None:
        mime_type, _ = mimetypes.guess_type(str(resolved))
    if mime_type is None:
        mime_type = "application/octet-stream"

    return send_file(resolved, mimetype=mime_type)


if __name__ == "__main__":
    MUSIC_DIR.mkdir(parents=True, exist_ok=True)
    PLAYLIST_DIR.mkdir(parents=True, exist_ok=True)
    print("=" * 50)
    print("  🎵 Music Player")
    print("  http://localhost:5000 でアクセスしてください")
    print(f"  音楽ファイルは {MUSIC_DIR} に配置してください")
    print(f"  プレイリストファイルは {PLAYLIST_DIR} に配置してください")
    print("=" * 50)
    app.run(host="127.0.0.1", port=5000, debug=False)

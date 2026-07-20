class PlaylistManager {
    constructor() {
        this.playlists = [];
        this.libraryTracks = [];
        this.trackByPath = new Map();
        this.artCache = new Map();
        this.activePlaylistId = '';
        this.activePlaylistData = { tracks: [] };
        this.selectedFolder = '__all__';
        this.cacheElements();
        this.bindEvents();
        this.init();
    }

    cacheElements() {
        this.els = {
            newPlaylistName: document.getElementById('newPlaylistName'),
            createPlaylistBtn: document.getElementById('createPlaylistBtn'),
            playlistList: document.getElementById('playlistList'),
            currentPlaylistName: document.getElementById('currentPlaylistName'),
            savePlaylistBtn: document.getElementById('savePlaylistBtn'),
            deletePlaylistBtn: document.getElementById('deletePlaylistBtn'),
            librarySearchInput: document.getElementById('librarySearchInput'),
            folderFilterSelect: document.getElementById('folderFilterSelect'),
            libraryTrackList: document.getElementById('libraryTrackList'),
            currentItems: document.getElementById('currentItems'),
            statusText: document.getElementById('statusText'),
        };
    }

    bindEvents() {
        this.els.createPlaylistBtn.addEventListener('click', () => this.createPlaylist());
        this.els.savePlaylistBtn.addEventListener('click', () => this.savePlaylist());
        this.els.deletePlaylistBtn.addEventListener('click', () => this.deletePlaylist());
        this.els.librarySearchInput.addEventListener('input', () => this.renderLibraryTracks());
        this.els.folderFilterSelect.addEventListener('change', (e) => {
            this.selectedFolder = e.target.value;
            this.renderLibraryTracks();
        });
    }

    async init() {
        await Promise.all([this.loadLibrary(), this.loadPlaylists()]);
    }

    async loadLibrary() {
        const res = await fetch('/api/tracks');
        this.libraryTracks = res.ok ? await res.json() : [];
        this.trackByPath = new Map(this.libraryTracks.map((t) => [t.path, t]));
        this.updateFolderFilterOptions();
        this.renderLibraryTracks();
    }

    getTrackFolder(pathValue) {
        const raw = String(pathValue || '').replace(/\\/g, '/');
        const idx = raw.lastIndexOf('/');
        return idx >= 0 ? raw.slice(0, idx) : '';
    }

    isTrackInFolder(track, folder) {
        if (folder === '__all__') return true;
        const normalizedFolder = String(folder || '').replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
        const trackPath = String(track?.path || '').replace(/\\/g, '/').toLowerCase();
        return trackPath === normalizedFolder || trackPath.startsWith(`${normalizedFolder}/`);
    }

    updateFolderFilterOptions() {
        const folders = Array.from(new Set(this.libraryTracks
            .map((t) => this.getTrackFolder(t.path))
            .filter(Boolean)))
            .sort((a, b) => a.localeCompare(b, 'ja'));

        this.els.folderFilterSelect.innerHTML = [
            '<option value="__all__">すべてのフォルダ</option>',
            ...folders.map((f) => `<option value="${this.escapeHtml(f)}">${this.escapeHtml(f)}</option>`),
        ].join('');

        if (this.selectedFolder !== '__all__' && folders.includes(this.selectedFolder)) {
            this.els.folderFilterSelect.value = this.selectedFolder;
        } else {
            this.selectedFolder = '__all__';
            this.els.folderFilterSelect.value = '__all__';
        }
    }

    async loadPlaylists() {
        const res = await fetch('/api/playlists');
        this.playlists = res.ok ? await res.json() : [];
        this.renderPlaylists();
        if (this.activePlaylistId && this.playlists.some((p) => p.id === this.activePlaylistId)) {
            await this.selectPlaylist(this.activePlaylistId);
        }
    }

    renderPlaylists() {
        if (!this.playlists.length) {
            this.els.playlistList.innerHTML = '<p class="track-sub">プレイリストがありません</p>';
            return;
        }

        this.els.playlistList.innerHTML = this.playlists.map((p) => `
            <button class="playlist-item ${p.id === this.activePlaylistId ? 'active' : ''}" data-id="${this.escapeHtml(p.id)}">
                <div class="playlist-item-art">
                    <span class="material-icons-round">queue_music</span>
                </div>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${this.escapeHtml(p.name)}</div>
                    <div class="playlist-item-artist">${p.count} 件</div>
                </div>
            </button>
        `).join('');

        this.els.playlistList.querySelectorAll('.playlist-item').forEach((btn) => {
            btn.addEventListener('click', () => this.selectPlaylist(btn.dataset.id));
        });
    }

    async selectPlaylist(id) {
        this.activePlaylistId = id;
        const encoded = id.split('/').map((s) => encodeURIComponent(s)).join('/');
        const res = await fetch(`/api/playlists/${encoded}/raw`);
        if (!res.ok) {
            this.setStatus('プレイリスト読み込みに失敗しました', true);
            return;
        }
        const payload = await res.json();
        this.activePlaylistData = payload.playlist || { tracks: [] };
        this.els.currentPlaylistName.textContent = payload.playlist.name;
        this.els.savePlaylistBtn.disabled = false;
        this.els.deletePlaylistBtn.disabled = false;
        this.renderPlaylists();
        this.renderLibraryTracks();
        this.renderCurrentItems();
    }

    renderLibraryTracks() {
        this.updateFolderFilterOptions();
        const keyword = (this.els.librarySearchInput.value || '').toLowerCase().trim();
        const selected = new Set(this.activePlaylistData.tracks || []);
        const list = this.libraryTracks.filter((t) => {
            if (!this.isTrackInFolder(t, this.selectedFolder)) return false;
            if (!keyword) return true;
            const bag = `${t.title || ''} ${t.artist || ''} ${t.album || ''} ${t.path || ''}`.toLowerCase();
            return bag.includes(keyword);
        });

        if (!list.length) {
            const hint = keyword
                ? '検索条件を変更するか、検索欄を空にしてください。'
                : '別のフォルダを選択してください。';
            this.els.libraryTrackList.innerHTML = `<p class="track-sub">該当する曲がありません。${hint}</p>`;
            return;
        }

        this.els.libraryTrackList.innerHTML = list.map((t) => {
            const subtitle = `${t.artist || 'Unknown Artist'} / ${t.album || 'Unknown Album'}`;
            return `
            <label class="playlist-item selectable ${selected.has(t.path) ? 'selected' : ''}" data-path="${this.escapeHtml(t.path)}">
                <div class="playlist-item-art" data-art-path="${this.escapeHtml(t.path)}">
                    <span class="material-icons-round">music_note</span>
                </div>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${this.escapeHtml(t.title || 'Unknown')}</div>
                    <div class="playlist-item-artist">${this.escapeHtml(subtitle)}</div>
                </div>
                <div class="playlist-item-duration">${this.formatTime(t.duration)}</div>
                <input type="checkbox" data-path="${this.escapeHtml(t.path)}" ${selected.has(t.path) ? 'checked' : ''} ${this.activePlaylistId ? '' : 'disabled'}>
            </label>
        `;
        }).join('');

        this.els.libraryTrackList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
            cb.addEventListener('change', () => {
                if (!this.activePlaylistId) return;
                const path = cb.dataset.path;
                const set = new Set(this.activePlaylistData.tracks || []);
                if (cb.checked) set.add(path);
                else set.delete(path);
                this.activePlaylistData.tracks = [...set];
                this.renderCurrentItems();
            });
        });

        this.loadArtworkInto(this.els.libraryTrackList);
    }

    renderCurrentItems() {
        if (!this.activePlaylistId) {
            this.els.currentItems.innerHTML = '<p class="track-sub">プレイリストを選択してください</p>';
            return;
        }

        const localItems = (this.activePlaylistData.tracks || []).map((path) => {
            const meta = this.libraryTracks.find((t) => t.path === path);
            return {
                type: 'local',
                key: path,
                title: meta?.title || path,
                sub: meta ? `${meta.artist || 'Unknown Artist'} / ${meta.album || 'Unknown Album'}` : path,
            };
        });
        const all = [...localItems];
        if (!all.length) {
            this.els.currentItems.innerHTML = '<p class="track-sub">まだ項目がありません</p>';
            return;
        }

        this.els.currentItems.innerHTML = all.map((item) => `
            <div class="playlist-item" data-path="${this.escapeHtml(item.key)}">
                <div class="playlist-item-art" data-art-path="${this.escapeHtml(item.key)}">
                    <span class="material-icons-round">music_note</span>
                </div>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${this.escapeHtml(item.title)}</div>
                    <div class="playlist-item-artist">${this.escapeHtml(item.sub)}</div>
                </div>
                <button class="remove-btn" data-type="${item.type}" data-key="${this.escapeHtml(item.key)}">×</button>
            </div>
        `).join('');

        this.els.currentItems.querySelectorAll('.remove-btn').forEach((btn) => {
            btn.addEventListener('click', () => this.removeItem(btn.dataset.type, btn.dataset.key));
        });

        this.loadArtworkInto(this.els.currentItems);
    }

    async loadArtworkInto(rootEl) {
        const holders = rootEl.querySelectorAll('.playlist-item-art[data-art-path]');
        for (const holder of holders) {
            if (holder.dataset.loaded === '1') continue;
            const path = holder.dataset.artPath;
            const track = this.trackByPath.get(path);
            if (!track || !track.hasArt) continue;

            const dataUrl = await this.getArtDataUrl(path);
            if (!dataUrl) continue;

            const icon = holder.querySelector('.material-icons-round');
            if (!icon) continue;

            const img = document.createElement('img');
            img.src = dataUrl;
            img.alt = '';
            holder.insertBefore(img, icon);
            icon.style.display = 'none';
            holder.dataset.loaded = '1';
        }
    }

    async getArtDataUrl(path) {
        if (this.artCache.has(path)) return this.artCache.get(path);
        try {
            const encoded = path.split('/').map((s) => encodeURIComponent(s)).join('/');
            const res = await fetch(`/api/art/${encoded}`);
            if (!res.ok) {
                this.artCache.set(path, '');
                return '';
            }
            const art = await res.json();
            const dataUrl = `data:${art.mime};base64,${art.data}`;
            this.artCache.set(path, dataUrl);
            return dataUrl;
        } catch {
            this.artCache.set(path, '');
            return '';
        }
    }

    removeItem(type, key) {
        if (type !== 'local') return;
        this.activePlaylistData.tracks = (this.activePlaylistData.tracks || []).filter((p) => p !== key);
        this.renderLibraryTracks();
        this.renderCurrentItems();
    }

    async createPlaylist() {
        const name = (this.els.newPlaylistName.value || '').trim();
        if (!name) {
            this.setStatus('プレイリスト名を入力してください', true);
            return;
        }
        const res = await fetch('/api/playlists/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, tracks: [] }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
            this.setStatus(data.error || '作成に失敗しました', true);
            return;
        }
        this.els.newPlaylistName.value = '';
        await this.loadPlaylists();
        await this.selectPlaylist(data.playlist.id);
        this.setStatus(`作成しました: ${data.playlist.name}`);
    }

    async savePlaylist() {
        if (!this.activePlaylistId) return;

        const res = await fetch('/api/playlists/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playlistId: this.activePlaylistId,
                tracks: this.activePlaylistData.tracks || [],
            }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
            this.setStatus(data.error || '保存に失敗しました', true);
            return;
        }
        await this.loadPlaylists();
        await this.selectPlaylist(this.activePlaylistId);
        this.setStatus('プレイリストを保存しました');
    }

    async deletePlaylist() {
        if (!this.activePlaylistId) return;
        if (!window.confirm('このプレイリストを削除しますか？')) return;

        const encoded = this.activePlaylistId.split('/').map((s) => encodeURIComponent(s)).join('/');
        const res = await fetch(`/api/playlists/${encoded}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok || !data.ok) {
            this.setStatus(data.error || '削除に失敗しました', true);
            return;
        }

        this.activePlaylistId = '';
        this.activePlaylistData = { tracks: [] };
        this.els.currentPlaylistName.textContent = 'プレイリストを選択してください';
        this.els.savePlaylistBtn.disabled = true;
        this.els.deletePlaylistBtn.disabled = true;
        this.els.currentItems.innerHTML = '<p class="track-sub">プレイリストを選択してください</p>';
        await this.loadPlaylists();
        this.renderLibraryTracks();
        this.setStatus('プレイリストを削除しました');
    }

    setStatus(message, isError = false) {
        this.els.statusText.textContent = message;
        this.els.statusText.style.color = isError ? '#ffaaaa' : 'rgba(245,247,255,0.82)';
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = String(str ?? '');
        return div.innerHTML;
    }

    formatTime(seconds) {
        if (!seconds || Number.isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    }
}

new PlaylistManager();

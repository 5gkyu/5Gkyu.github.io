/**
 * Music Player - メインロジック
 */

class MusicPlayer {
    constructor() {
        this.themes = this.buildThemes();
        this.currentTheme = this.themes['midnight-bloom'];
        this.currentThemeKey = 'midnight-bloom';
        this.reactiveColorsFromArtwork = null;
        this.audio = document.getElementById('audioPlayer');
        this.tracks = [];
        this.pathToIndex = new Map();
        this.playlists = [];
        this.playlistTracks = [];
        this.filteredTracks = [];
        this.currentQueuePos = -1;
        this.currentIndex = -1;
        this.isPlaying = false;
        this.isShuffle = false;
        this.sourceMode = 'library';
        this.selectedPlaylistId = '';
        this.selectedFolder = '__all__';
        this.selectedAlbum = '__all__';
        this.sortKey = 'title';
        this.sortOrder = 'asc';
        this.repeatMode = 0; // 0: off, 1: all, 2: one
        this.shuffleQueue = [];
        this.shuffleIndex = -1;
        this.audioContext = null;
        this.analyser = null;
        this.sourceNode = null;
        this.visualizerData = null;
        this.visualizerFrame = null;
        this.currentTrack = null;
        this.workspacePlaylistId = '';
        this.workspacePlaylistData = { tracks: [] };
        this.workspaceTrackMap = new Map();
        this.workspaceArtCache = new Map();
        this.folderBrowserMode = 'cards';
        this.folderBrowserFolders = [];
        this.selectedFolderPath = '';
        this.folderBrowserSelectedImage = '';
        this.folderBrowserSelectedSteamAppId = '';
        this.steamSoundtrackApps = [];
        this.folderLocalImageItems = [];
        this.folderAutoSteamImageItems = [];
        this.folderManualSteamImageItems = [];

        // Editor state
        this.editorMode = false;
        this.editorTracks = [];
        this.editorFiltered = [];
        this.editorSelectedPaths = new Set();
        this.editorLastClickedIndex = -1;
        this.editorCurrentTrack = null;
        this.editorPendingArtworkData = '';
        this.editorArtCache = new Map();
        this.editorSelectedFolderImagePath = '';
        this.editorLastFolderImageTarget = '';
        this.editorSteamApps = [];
        this.editorSteamAppsLoaded = false;
        this.editorSteamAppsLoading = false;
        this.editorSteamCandidates = [];

        this.cacheElements();
        this.initTheme();
        this.bindEvents();
        this.loadTracks();
        this.loadLibraryPath();
        this.setVolume(80);
        this.resizeVisualizerCanvas();
        this.drawVisualizerIdle();
    }

    cacheElements() {
        this.els = {
            playlist: document.getElementById('playlist'),
            trackTitle: document.getElementById('trackTitle'),
            trackArtist: document.getElementById('trackArtist'),
            trackAlbum: document.getElementById('trackAlbum'),
            trackFolder: document.getElementById('trackFolder'),
            trackMetaChips: document.getElementById('trackMetaChips'),
            trackTech: document.getElementById('trackTech'),
            trackCount: document.getElementById('trackCount'),
            artworkImage: document.getElementById('artworkImage'),
            artworkDefault: document.getElementById('artworkDefault'),
            artworkWrapper: document.getElementById('artworkWrapper'),
            bgArtwork: document.getElementById('bgArtwork'),
            seekBar: document.getElementById('seekBar'),
            seekProgress: document.getElementById('seekProgress'),
            currentTime: document.getElementById('currentTime'),
            totalTime: document.getElementById('totalTime'),
            playIcon: document.getElementById('playIcon'),
            btnPlay: document.getElementById('btnPlay'),
            btnPrev: document.getElementById('btnPrev'),
            btnNext: document.getElementById('btnNext'),
            btnShuffle: document.getElementById('btnShuffle'),
            btnRepeat: document.getElementById('btnRepeat'),
            volumeBar: document.getElementById('volumeBar'),
            volumeProgress: document.getElementById('volumeProgress'),
            volumeIcon: document.getElementById('volumeIcon'),
            btnMute: document.getElementById('btnMute'),
            visualizerCanvas: document.getElementById('visualizerCanvas'),
            themeSelect: document.getElementById('themeSelect'),
            searchInput: document.getElementById('searchInput'),
            playlistSelect: document.getElementById('playlistSelect'),
            folderFilterSelect: document.getElementById('folderFilterSelect'),
            albumFilterSelect: document.getElementById('albumFilterSelect'),
            sortKeySelect: document.getElementById('sortKeySelect'),
            sortOrderSelect: document.getElementById('sortOrderSelect'),
            openPlaylistWorkspaceBtn: document.getElementById('openPlaylistWorkspaceBtn'),
            playlistWorkspace: document.getElementById('playlistWorkspace'),
            closePlaylistWorkspaceBtn: document.getElementById('closePlaylistWorkspaceBtn'),
            workspaceNewPlaylistName: document.getElementById('workspaceNewPlaylistName'),
            workspaceCreatePlaylistBtn: document.getElementById('workspaceCreatePlaylistBtn'),
            workspacePlaylistSelect: document.getElementById('workspacePlaylistSelect'),
            workspaceSavePlaylistBtn: document.getElementById('workspaceSavePlaylistBtn'),
            workspaceDeletePlaylistBtn: document.getElementById('workspaceDeletePlaylistBtn'),
            workspaceLibrarySearchInput: document.getElementById('workspaceLibrarySearchInput'),
            workspaceLibraryList: document.getElementById('workspaceLibraryList'),
            workspacePlaylistItems: document.getElementById('workspacePlaylistItems'),
            workspaceStatus: document.getElementById('workspaceStatus'),
            openSettingsBtn: document.getElementById('openSettingsBtn'),
            settingsPanel: document.getElementById('settingsPanel'),
            closeSettingsBtn: document.getElementById('closeSettingsBtn'),
            libraryPathInput: document.getElementById('libraryPathInput'),
            saveLibraryPathBtn: document.getElementById('saveLibraryPathBtn'),
            libraryPathStatus: document.getElementById('libraryPathStatus'),
            playerArea: document.getElementById('playerArea'),
            mainVisualizer: document.getElementById('mainVisualizer'),
            openSteamBrowserBtn: document.getElementById('openSteamBrowserBtn'),
            steamBrowser: document.getElementById('steamBrowser'),
            closeSteamBrowserBtn: document.getElementById('closeSteamBrowserBtn'),
            steamBackToGridBtn: document.getElementById('steamBackToGridBtn'),
            steamBrowserSearchInput: document.getElementById('steamBrowserSearchInput'),
            steamBrowserGridView: document.getElementById('steamBrowserGridView'),
            steamBrowserDetailView: document.getElementById('steamBrowserDetailView'),
            steamGameGrid: document.getElementById('steamGameGrid'),
            steamDetailImage: null,
            steamDetailTitle: null,
            steamDetailAppId: null,
            steamDetailFolderSelect: null,
            steamUseLibraryBtn: null,
            folderModeCardBtn: document.getElementById('folderModeCardBtn'),
            folderModePathBtn: document.getElementById('folderModePathBtn'),
            folderCardView: document.getElementById('folderCardView'),
            folderPathView: document.getElementById('folderPathView'),
            folderPathInput: document.getElementById('folderPathInput'),
            folderPathOpenBtn: document.getElementById('folderPathOpenBtn'),
            folderDetailTitle: document.getElementById('folderDetailTitle'),
            folderSteamSearchInput: document.getElementById('folderSteamSearchInput'),
            folderSteamSearchBtn: document.getElementById('folderSteamSearchBtn'),
            folderSteamSearchStatus: document.getElementById('folderSteamSearchStatus'),
            folderImageGrid: document.getElementById('folderImageGrid'),
            folderImageUploadInput: document.getElementById('folderImageUploadInput'),
            folderImageStatus: document.getElementById('folderImageStatus'),
            folderApplyImageBtn: document.getElementById('folderApplyImageBtn'),
            steamTrackPreviewList: document.getElementById('steamTrackPreviewList'),
            sidebar: document.getElementById('sidebar'),
            mobileMenuBtn: document.getElementById('mobileMenuBtn'),

            // Window chrome (pywebview frameless)
            winMiniBtn:  document.getElementById('winMiniBtn'),
            miniExitBtn: document.getElementById('miniExitBtn'),
            winPhoneBtn: document.getElementById('winPhoneBtn'),
            winMinBtn: document.getElementById('winMinBtn'),
            winMaxBtn: document.getElementById('winMaxBtn'),
            winMaxIcon: document.getElementById('winMaxIcon'),
            winCloseBtn: document.getElementById('winCloseBtn'),
            titlebarDrag: document.getElementById('titlebarDrag'),

            // Editor
            openEditorBtn: document.getElementById('openEditorBtn'),
            openPlayerBtn: document.getElementById('openPlayerBtn'),
            editorPanel: document.getElementById('editorPanel'),
            editorCloseBtn: document.getElementById('editorCloseBtn'),
            editorNowPlaying: document.getElementById('editorNowPlaying'),
            editorSelectionInfo: document.getElementById('editorSelectionInfo'),
            editorBulkCount: document.getElementById('editorBulkCount'),
            editorSelectAllBtn: document.getElementById('editorSelectAllBtn'),
            editorDeselectAllBtn: document.getElementById('editorDeselectAllBtn'),
            editorBulkEditBtn: document.getElementById('editorBulkEditBtn'),
            editorOrganizeBtn: document.getElementById('editorOrganizeBtn'),
            editorTrackPane: document.getElementById('editorTrackPane'),
            editorMiniTitle: document.getElementById('editorMiniTitle'),
            editorMiniPlayBtn: document.getElementById('editorMiniPlayBtn'),
            editorMiniPlayIcon: document.getElementById('editorMiniPlayIcon'),
            editorFileName: document.getElementById('editorFileName'),
            editorFilePath: document.getElementById('editorFilePath'),
            editorSaveBtn: document.getElementById('editorSaveBtn'),
            editorChooseArtworkBtn: document.getElementById('editorChooseArtworkBtn'),
            editorSaveArtworkBtn: document.getElementById('editorSaveArtworkBtn'),
            editorArtworkInput: document.getElementById('editorArtworkInput'),
            editorArtworkPreview: document.getElementById('editorArtworkPreview'),
            editorArtworkEmpty: document.getElementById('editorArtworkEmpty'),
            editorStatusText: document.getElementById('editorStatusText'),
            editorTitle: document.getElementById('editorTitle'),
            editorArtist: document.getElementById('editorArtist'),
            editorAlbum: document.getElementById('editorAlbum'),
            editorAlbumArtist: document.getElementById('editorAlbumArtist'),
            editorGenre: document.getElementById('editorGenre'),
            editorYear: document.getElementById('editorYear'),
            editorTrackNumber: document.getElementById('editorTrackNumber'),
            editorDiscNumber: document.getElementById('editorDiscNumber'),
            emCodec: document.getElementById('emCodec'),
            emBitrate: document.getElementById('emBitrate'),
            emSampleRate: document.getElementById('emSampleRate'),
            emChannels: document.getElementById('emChannels'),
            emBitDepth: document.getElementById('emBitDepth'),
            emSize: document.getElementById('emSize'),
            editorBulkEditCard: document.getElementById('editorBulkEditCard'),
            editorBulkArtist: document.getElementById('editorBulkArtist'),
            editorBulkAlbum: document.getElementById('editorBulkAlbum'),
            editorBulkAlbumArtist: document.getElementById('editorBulkAlbumArtist'),
            editorBulkGenre: document.getElementById('editorBulkGenre'),
            editorBulkYear: document.getElementById('editorBulkYear'),
            editorBulkDiscNumber: document.getElementById('editorBulkDiscNumber'),
            editorBulkSaveBtn: document.getElementById('editorBulkSaveBtn'),
            editorBulkCancelBtn: document.getElementById('editorBulkCancelBtn'),
            editorBulkStatusText: document.getElementById('editorBulkStatusText'),
            editorOrganizeCard: document.getElementById('editorOrganizeCard'),
            editorOrganizePresetSelect: document.getElementById('editorOrganizePresetSelect'),
            editorSteamOrganizeFields: document.getElementById('editorSteamOrganizeFields'),
            editorSteamGameSearchInput: document.getElementById('editorSteamGameSearchInput'),
            editorSteamGameSelect: document.getElementById('editorSteamGameSelect'),
            editorSteamAppIdInput: document.getElementById('editorSteamAppIdInput'),
            editorDefaultFolderStructure: document.getElementById('editorDefaultFolderStructure'),
            editorSteamFolderStructure: document.getElementById('editorSteamFolderStructure'),
            editorOrganizePreview: document.getElementById('editorOrganizePreview'),
            editorOrganizeExecuteBtn: document.getElementById('editorOrganizeExecuteBtn'),
            editorOrganizePreviewBtn: document.getElementById('editorOrganizePreviewBtn'),
            editorOrganizeCancelBtn: document.getElementById('editorOrganizeCancelBtn'),
            editorOrganizeStatusText: document.getElementById('editorOrganizeStatusText'),
            editorFolderBulkTrackCount: document.getElementById('editorFolderBulkTrackCount'),
            editorFolderBulkArtist: document.getElementById('editorFolderBulkArtist'),
            editorFolderBulkAlbum: document.getElementById('editorFolderBulkAlbum'),
            editorFolderBulkAlbumArtist: document.getElementById('editorFolderBulkAlbumArtist'),
            editorFolderBulkGenre: document.getElementById('editorFolderBulkGenre'),
            editorFolderBulkYear: document.getElementById('editorFolderBulkYear'),
            editorApplyFolderBulkBtn: document.getElementById('editorApplyFolderBulkBtn'),
            editorFolderBulkStatusText: document.getElementById('editorFolderBulkStatusText'),
            editorFolderImageFolderInput: document.getElementById('editorFolderImageFolderInput'),
            editorFolderImagePathInput: document.getElementById('editorFolderImagePathInput'),
            editorLoadFolderImagesBtn: document.getElementById('editorLoadFolderImagesBtn'),
            editorFolderImagePreviewGrid: document.getElementById('editorFolderImagePreviewGrid'),
            editorApplyFolderImageBtn: document.getElementById('editorApplyFolderImageBtn'),
            editorFolderImageStatusText: document.getElementById('editorFolderImageStatusText'),
        };
    }

    bindEvents() {
        // 再生コントロール
        this.els.btnPlay.addEventListener('click', () => this.togglePlay());
        this.els.btnPrev.addEventListener('click', () => this.prevTrack());
        this.els.btnNext.addEventListener('click', () => this.nextTrack());
        this.els.btnShuffle.addEventListener('click', () => this.toggleShuffle());
        this.els.btnRepeat.addEventListener('click', () => this.toggleRepeat());

        this.els.themeSelect.addEventListener('change', (e) => this.applyThemeByKey(e.target.value));

        // シークバー
        this.els.seekBar.addEventListener('input', (e) => this.onSeekInput(e));

        this.els.seekBar.addEventListener('change', (e) => this.onSeekChange(e));

        // ボリューム
        this.els.volumeBar.addEventListener('input', (e) => this.onVolumeInput(e));
        this.els.btnMute.addEventListener('click', () => this.toggleMute());

        // オーディオイベント
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('ended', () => this.onTrackEnd());
        this.audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        this.audio.addEventListener('pause', () => this.drawVisualizerIdle());
        this.audio.addEventListener('play', () => this.startVisualizer());

        // 検索
        this.els.searchInput.addEventListener('input', () => this.onSearch());

        // フィルタ・ソート
        this.els.playlistSelect.addEventListener('change', (e) => this.onPlaylistChange(e.target.value));
        this.els.folderFilterSelect.addEventListener('change', (e) => this.onFolderFilterChange(e.target.value));
        this.els.albumFilterSelect.addEventListener('change', (e) => this.onAlbumFilterChange(e.target.value));
        this.els.sortKeySelect.addEventListener('change', (e) => this.onSortChange(e.target.value, this.sortOrder));
        this.els.sortOrderSelect.addEventListener('change', (e) => this.onSortChange(this.sortKey, e.target.value));
        this.els.openPlaylistWorkspaceBtn.addEventListener('click', () => this.openPlaylistWorkspace());
        this.els.closePlaylistWorkspaceBtn.addEventListener('click', () => this.closePlaylistWorkspace());
        this.els.workspaceCreatePlaylistBtn.addEventListener('click', () => this.workspaceCreatePlaylist());
        this.els.workspacePlaylistSelect.addEventListener('change', (e) => this.workspaceSelectPlaylist(e.target.value));
        this.els.workspaceSavePlaylistBtn.addEventListener('click', () => this.workspaceSavePlaylist());
        this.els.workspaceDeletePlaylistBtn.addEventListener('click', () => this.workspaceDeletePlaylist());
        this.els.workspaceLibrarySearchInput.addEventListener('input', () => this.renderWorkspaceLibrary());
        this.els.openSettingsBtn.addEventListener('click', () => this.openSettingsPanel());
        this.els.closeSettingsBtn.addEventListener('click', () => this.closeSettingsPanel());
        this.els.saveLibraryPathBtn.addEventListener('click', () => this.saveLibraryPath());

        this.els.openSteamBrowserBtn.addEventListener('click', () => this.openFolderBrowser());
        this.els.closeSteamBrowserBtn.addEventListener('click', () => this.closeFolderBrowser());
        this.els.steamBackToGridBtn.addEventListener('click', () => this.showFolderGrid());
        this.els.steamBrowserSearchInput.addEventListener('input', () => this.renderFolderCardGrid());
        this.els.folderModeCardBtn.addEventListener('click', () => this.setFolderBrowserMode('cards'));
        this.els.folderModePathBtn.addEventListener('click', () => this.setFolderBrowserMode('path'));
        this.els.folderPathOpenBtn.addEventListener('click', () => this.openFolderByPath());
        this.els.folderPathInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.openFolderByPath(); });
        this.els.folderSteamSearchBtn.addEventListener('click', () => this.searchSteamCapsulesManual());
        this.els.folderSteamSearchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.searchSteamCapsulesManual(); });
        this.els.folderApplyImageBtn.addEventListener('click', () => this.applyFolderImage());
        this.els.folderImageUploadInput.addEventListener('change', (e) => this.onFolderImageUploadSelected(e));

        // Editor モード切替
        this.els.openEditorBtn.addEventListener('click', () => this.enterEditorMode());
        this.els.openPlayerBtn.addEventListener('click', () => this.exitEditorMode());
        this.els.editorCloseBtn.addEventListener('click', () => this.exitEditorMode());
        this.els.editorMiniPlayBtn.addEventListener('click', () => this.togglePlay());

        // Editor トラックリストクリック
        this.els.editorTrackPane.addEventListener('click', (e) => this.editorOnTrackListClick(e));

        // Editor 選択アクション
        this.els.editorSelectAllBtn.addEventListener('click', () => this.editorSelectAll());
        this.els.editorDeselectAllBtn.addEventListener('click', () => this.editorDeselectAll());
        this.els.editorBulkEditBtn.addEventListener('click', () => this.editorShowBulkEdit());
        this.els.editorOrganizeBtn.addEventListener('click', () => this.editorShowOrganize());

        // Editor 単一編集
        this.els.editorSaveBtn.addEventListener('click', () => this.editorSaveCurrent());
        this.els.editorChooseArtworkBtn.addEventListener('click', () => this.els.editorArtworkInput.click());
        this.els.editorArtworkInput.addEventListener('change', (e) => this.editorOnArtworkSelected(e));
        this.els.editorSaveArtworkBtn.addEventListener('click', () => this.editorSaveArtwork());

        // Editor 一括編集
        this.els.editorBulkSaveBtn.addEventListener('click', () => this.editorApplyBulkEdit());
        this.els.editorBulkCancelBtn.addEventListener('click', () => this.editorHideBulkEdit());

        // Editor 整理
        this.els.editorOrganizePresetSelect.addEventListener('change', () => this.editorUpdateOrganizePresetView());
        this.els.editorSteamGameSearchInput.addEventListener('input', () => this.editorRenderSteamGameOptions());
        this.els.editorSteamGameSelect.addEventListener('change', () => this.editorSyncSteamGameSelection());
        this.els.editorOrganizePreviewBtn.addEventListener('click', () => this.editorPreviewOrganize());
        this.els.editorOrganizeExecuteBtn.addEventListener('click', () => this.editorExecuteOrganize());
        this.els.editorOrganizeCancelBtn.addEventListener('click', () => this.editorHideOrganize());

        // Editor フォルダ一括/画像
        this.els.editorApplyFolderBulkBtn.addEventListener('click', () => this.editorApplyFolderBulkUpdate());
        this.els.editorLoadFolderImagesBtn.addEventListener('click', () => this.editorLoadFolderImagesForPreview());
        this.els.editorApplyFolderImageBtn.addEventListener('click', () => this.editorApplyCapsule());

        // ミニプレイヤー更新 (再生/停止時)
        this.audio.addEventListener('play', () => { if (this.editorMode) this.editorUpdateMiniPlayer(); });
        this.audio.addEventListener('pause', () => { if (this.editorMode) this.editorUpdateMiniPlayer(); });

        // プレイリスト項目クリック (通常再生のみ)
        this.els.playlist.addEventListener('click', (e) => {
            const item = e.target.closest('.playlist-item');
            if (!item) return;
            const queuePos = parseInt(item.dataset.queuePos, 10);
            if (!Number.isNaN(queuePos)) {
                this.playTrackByQueuePos(queuePos);
            }
        });

        // モバイルメニュー
        this.els.mobileMenuBtn.addEventListener('click', () => this.toggleSidebar());

        // キーボードショートカット
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('resize', () => this.resizeVisualizerCanvas());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSettingsPanel();
            }
        });

        // サイドバー外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (this.els.sidebar.classList.contains('open') &&
                !this.els.sidebar.contains(e.target) &&
                e.target !== this.els.mobileMenuBtn &&
                !this.els.mobileMenuBtn.contains(e.target)) {
                this.els.sidebar.classList.remove('open');
            }
        });

        // ウィンドウ操作 (pywebview)
        this._bindWindowControls();
    }

    _toggleMiniMode(enable) {
        const hasPywebview = () => typeof pywebview !== 'undefined' && pywebview.api;
        document.body.classList.toggle('mini-mode', enable);
        if (!hasPywebview()) return;
        if (enable) {
            // プレイヤーエリアに収まるコンパクトサイズ
            const W = 360, H = 650;
            pywebview.api.resize_window(W, H)
                .then(() => pywebview.api.update_region(W, H));
        } else {
            // 元の大きさに戻す
            const W = 1280, H = 800;
            pywebview.api.resize_window(W, H)
                .then(() => pywebview.api.update_region(W, H));
        }
    }

    _bindWindowControls() {
        const hasPywebview = () => typeof pywebview !== 'undefined' && pywebview.api;

        if (this.els.winMiniBtn) {
            this.els.winMiniBtn.addEventListener('click', () => this._toggleMiniMode(true));
        }
        if (this.els.miniExitBtn) {
            this.els.miniExitBtn.addEventListener('click', () => this._toggleMiniMode(false));
        }
        if (this.els.winPhoneBtn) {
            this.els.winPhoneBtn.addEventListener('click', () => {
                if (!hasPywebview()) return;
                const W = 390, H = 844;
                const doResize = () => {
                    pywebview.api.resize_window(W, H)
                        .then(() => pywebview.api.update_region(W, H));
                };
                if (document.body.classList.contains('maximized')) {
                    pywebview.api.toggle_maximize().then(() => {
                        this._updateMaxIcon();
                        setTimeout(doResize, 150);
                    });
                } else {
                    doResize();
                }
            });
        }
        if (this.els.winMinBtn) {
            this.els.winMinBtn.addEventListener('click', () => {
                if (hasPywebview()) pywebview.api.minimize();
            });
        }
        if (this.els.winMaxBtn) {
            this.els.winMaxBtn.addEventListener('click', () => {
                if (hasPywebview()) {
                    pywebview.api.toggle_maximize().then(() => this._updateMaxIcon());
                }
            });
        }
        if (this.els.winCloseBtn) {
            this.els.winCloseBtn.addEventListener('click', () => {
                if (hasPywebview()) pywebview.api.close();
            });
        }

        // ダブルクリックで最大化切替
        if (this.els.titlebarDrag) {
            this.els.titlebarDrag.addEventListener('dblclick', () => {
                if (hasPywebview()) {
                    pywebview.api.toggle_maximize().then(() => this._updateMaxIcon());
                }
            });
        }

        // pywebview 準備完了 → 角丸リージョンを適用
        window.addEventListener('pywebviewready', () => {
            if (hasPywebview()) pywebview.api.apply_region();
        });

        // JS ドラッグ移動
        this._initDrag();

        // リサイズハンドル
        this._initResizeHandles();
    }

    _initDrag() {
        const el = this.els.titlebarDrag;
        if (el) {
            el.addEventListener('mousedown', e => {
                if (e.button !== 0) return;
                if (typeof pywebview === 'undefined' || !pywebview.api) return;
                if (document.body.classList.contains('maximized')) return;
                e.preventDefault();
                e.stopPropagation();
                this._startDrag(e);
            });
        }

        // ミニモード時はアプリコンテナ全体をドラッグ領域に
        const container = document.getElementById('appContainer');
        if (container) {
            container.addEventListener('mousedown', e => {
                if (!document.body.classList.contains('mini-mode')) return;
                if (e.button !== 0) return;
                if (typeof pywebview === 'undefined' || !pywebview.api) return;
                // ボタン・入力系クリックは無視
                if (e.target.closest('button, input, a, select, label')) return;
                e.preventDefault();
                this._startDrag(e);
            });
        }
    }

    _startDrag(e) {
        const el = this.els.titlebarDrag;
        let winX = window.screenX;
        let winY = window.screenY;
        let prevSX = e.screenX, prevSY = e.screenY;
        let rafId = null;
        if (el && !document.body.classList.contains('mini-mode')) el.style.cursor = 'grabbing';

        const commit = () => {
            pywebview.api.move_window(Math.round(winX), Math.round(winY));
            rafId = null;
        };
        const onMove = ev => {
            winX += ev.screenX - prevSX;
            winY += ev.screenY - prevSY;
            prevSX = ev.screenX;
            prevSY = ev.screenY;
            winY = Math.max(0, winY);
            if (!rafId) rafId = requestAnimationFrame(commit);
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            if (rafId) { cancelAnimationFrame(rafId); commit(); }
            if (el && !document.body.classList.contains('mini-mode')) el.style.cursor = '';
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    _initResizeHandles() {
        const MIN_W = 640, MIN_H = 480;
        document.querySelectorAll('.rsz').forEach(el => {
            el.addEventListener('mousedown', e => {
                if (typeof pywebview === 'undefined' || !pywebview.api) return;
                e.preventDefault();
                e.stopPropagation();
                const dir = el.dataset.dir;
                const startSX = e.screenX, startSY = e.screenY;

                // window.screenX/Y・innerWidth/Height はすべて同一 CSS px 単位
                // → get_position() の非同期・DPI 不一致が発生しない
                const startW = window.innerWidth;
                const startH = window.innerHeight;
                const startWX = window.screenX;
                const startWY = window.screenY;
                let pending = { w: startW, h: startH, x: startWX, y: startWY };
                let rafId = null;

                const flush = () => {
                    if (dir.includes('w') || dir.includes('n'))
                        pywebview.api.move_window(pending.x, pending.y);
                    pywebview.api.resize_window(pending.w, pending.h);
                    rafId = null;
                };

                const onMove = ev => {
                    const dx = ev.screenX - startSX, dy = ev.screenY - startSY;
                    let nW = startW, nH = startH, nX = startWX, nY = startWY;
                    if (dir.includes('e')) nW = Math.max(MIN_W, startW + dx);
                    if (dir.includes('s')) nH = Math.max(MIN_H, startH + dy);
                    if (dir.includes('w')) { nW = Math.max(MIN_W, startW - dx); nX = startWX + startW - nW; }
                    if (dir.includes('n')) { nH = Math.max(MIN_H, startH - dy); nY = startWY + startH - nH; }
                    pending = { w: nW, h: nH, x: nX, y: nY };
                    if (!rafId) rafId = requestAnimationFrame(flush);
                };

                const onUp = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                    if (rafId) { cancelAnimationFrame(rafId); flush(); }
                    pywebview.api.update_region(pending.w, pending.h);
                };

                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        });
    }

    _updateMaxIcon() {
        if (!this.els.winMaxIcon) return;
        const hasPywebview = () => typeof pywebview !== 'undefined' && pywebview.api;
        if (hasPywebview()) {
            pywebview.api.is_maximized().then(maximized => {
                this.els.winMaxIcon.textContent = maximized ? 'filter_none' : 'crop_square';
                const container = document.getElementById('appContainer');
                if (container) container.style.borderRadius = maximized ? '0' : '';
                document.body.classList.toggle('maximized', maximized);
                document.documentElement.style.clipPath = maximized ? 'none' : 'inset(0 round 18px)';
                // Win32 リージョンも同期更新
                if (maximized) {
                    pywebview.api.clear_region();
                } else {
                    pywebview.api.apply_region();
                }
            });
        }
    }

    // ========================================
    // トラック読み込み
    // ========================================

    async loadTracks() {
        try {
            const res = await fetch('/api/tracks');
            this.tracks = await res.json();
            this.pathToIndex = new Map(this.tracks.map((t, i) => [t.path, i]));
            this.workspaceTrackMap = new Map(this.tracks.map((t) => [t.path, t]));
            await this.loadPlaylists();
            this.applyFiltersAndRender();
            this.setInitialBackgroundFromArtwork();
        } catch (err) {
            console.error('トラック読み込みエラー:', err);
        }
    }

    async openPlaylistWorkspace() {
        this.els.playlistWorkspace.classList.add('open');
        this.els.playlistWorkspace.setAttribute('aria-hidden', 'false');
        await this.loadPlaylists();
        this.renderWorkspacePlaylistSelect();
        if (this.workspacePlaylistId) {
            await this.workspaceSelectPlaylist(this.workspacePlaylistId);
        } else {
            this.renderWorkspaceLibrary();
            this.renderWorkspaceCurrentItems();
        }
    }

    closePlaylistWorkspace() {
        this.els.playlistWorkspace.classList.remove('open');
        this.els.playlistWorkspace.setAttribute('aria-hidden', 'true');
    }

    async loadLibraryPath() {
        try {
            const res = await fetch('/api/library/path');
            if (!res.ok) {
                this.setLibraryPathStatus('ライブラリ設定の取得に失敗しました', true);
                return;
            }
            const data = await res.json();
            this.els.libraryPathInput.value = data.path || '';
            if (data.usingDefault) {
                this.setLibraryPathStatus('現在は既定のライブラリを使用中です');
            } else {
                this.setLibraryPathStatus('カスタムライブラリを使用中です');
            }
        } catch {
            this.setLibraryPathStatus('ライブラリ設定の取得に失敗しました', true);
        }
    }

    openSettingsPanel() {
        this.els.settingsPanel.classList.add('open');
        this.els.settingsPanel.setAttribute('aria-hidden', 'false');
        this.loadLibraryPath();
    }

    closeSettingsPanel() {
        this.els.settingsPanel.classList.remove('open');
        this.els.settingsPanel.setAttribute('aria-hidden', 'true');
    }

    setLibraryPathStatus(message, isError = false) {
        this.els.libraryPathStatus.textContent = message;
        this.els.libraryPathStatus.style.color = isError ? 'var(--danger, #ff8f8f)' : 'var(--text-secondary)';
    }

    async saveLibraryPath() {
        const pathValue = (this.els.libraryPathInput.value || '').trim();
        if (!pathValue) {
            this.setLibraryPathStatus('ライブラリパスを入力してください', true);
            return;
        }

        this.els.saveLibraryPathBtn.disabled = true;
        try {
            const res = await fetch('/api/library/path', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: pathValue }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                this.setLibraryPathStatus(data.error || '保存に失敗しました', true);
                return;
            }

            this.setLibraryPathStatus('保存しました。ライブラリを再読み込みしています...');
            this.workspaceArtCache.clear();
            this.workspacePlaylistData = { tracks: [] };
            this.workspacePlaylistId = '';
            this.currentTrack = null;
            this.currentIndex = -1;
            this.currentQueuePos = -1;
            this.audio.pause();
            this.audio.src = '';
            await this.loadTracks();
            await this.loadLibraryPath();
            this.setLibraryPathStatus('保存しました。ライブラリを更新しました。');
        } catch {
            this.setLibraryPathStatus('保存に失敗しました', true);
        } finally {
            this.els.saveLibraryPathBtn.disabled = false;
        }
    }

    openFolderBrowser() {
        this.els.playerArea.classList.add('hidden');
        this.els.mainVisualizer.classList.add('hidden');
        this.els.steamBrowser.classList.add('open');
        this.els.steamBrowser.setAttribute('aria-hidden', 'false');
        this.showFolderGrid();
        this.loadLibraryFolders();
    }

    closeFolderBrowser() {
        this.els.steamBrowser.classList.remove('open');
        this.els.steamBrowser.setAttribute('aria-hidden', 'true');
        this.els.playerArea.classList.remove('hidden');
        this.els.mainVisualizer.classList.remove('hidden');
    }

    showFolderGrid() {
        this.els.steamBrowserGridView.hidden = false;
        this.els.steamBrowserDetailView.hidden = true;
        this.els.steamBackToGridBtn.disabled = true;
    }

    setFolderBrowserMode(mode) {
        this.folderBrowserMode = mode;
        if (mode === 'cards') {
            this.els.folderCardView.hidden = false;
            this.els.folderPathView.hidden = true;
            this.els.folderModeCardBtn.classList.add('active');
            this.els.folderModePathBtn.classList.remove('active');
        } else {
            this.els.folderCardView.hidden = true;
            this.els.folderPathView.hidden = false;
            this.els.folderModeCardBtn.classList.remove('active');
            this.els.folderModePathBtn.classList.add('active');
        }
    }

    async loadLibraryFolders() {
        this.els.steamGameGrid.innerHTML = '<p class="tool-note">フォルダを読み込み中...</p>';
        try {
            const res = await fetch('/api/library/folders');
            if (!res.ok) throw new Error(`${res.status}`);
            const data = await res.json();
            this.folderBrowserFolders = data.folders || [];
            this.renderFolderCardGrid();
        } catch {
            this.els.steamGameGrid.innerHTML = '<p class="tool-note">フォルダの読み込みに失敗しました。</p>';
        }
    }

    renderFolderCardGrid() {
        const q = (this.els.steamBrowserSearchInput.value || '').trim().toLowerCase();
        const list = this.folderBrowserFolders.filter((f) => {
            if (!q) return true;
            return f.path.toLowerCase().includes(q) || f.name.toLowerCase().includes(q);
        });
        if (!list.length) {
            this.els.steamGameGrid.innerHTML = '<p class="tool-note">フォルダが見つかりません。</p>';
            return;
        }
        this.els.steamGameGrid.innerHTML = list.map((folder) => {
            const previewPath = String(folder.previewImage || '');
            const visual = previewPath
                ? `<div class="folder-card-icon"><img src="/api/editor/image/${previewPath.split('/').map((s) => encodeURIComponent(s)).join('/')}" alt="${this.escapeHtml(folder.name || folder.path)}" loading="lazy"></div>`
                : '<div class="folder-card-icon"><span class="material-icons-round">folder</span></div>';
            return `
            <button class="steam-game-card folder-card" data-path="${this.escapeHtml(folder.path)}" type="button">
                ${visual}
                <div class="steam-game-card-title">${this.escapeHtml(folder.path)}</div>
            </button>
        `;
        }).join('');
        this.els.steamGameGrid.querySelectorAll('.folder-card').forEach((btn) => {
            btn.addEventListener('click', () => this.showFolderDetail(btn.dataset.path));
        });
    }

    openFolderByPath() {
        const path = (this.els.folderPathInput.value || '').trim();
        if (!path) return;
        this.showFolderDetail(path);
    }

    async showFolderDetail(folderPath) {
        this.selectedFolderPath = folderPath;
        this.folderBrowserSelectedImage = '';
        this.folderBrowserSelectedSteamAppId = '';
        this.folderLocalImageItems = [];
        this.folderAutoSteamImageItems = [];
        this.folderManualSteamImageItems = [];
        this.els.folderDetailTitle.textContent = folderPath;
        this.els.folderImageStatus.textContent = '画像またはSteamカプセルを選択してください。';
        this.els.folderSteamSearchInput.value = '';
        this.els.folderSteamSearchStatus.textContent = '必要に応じて手動でSteamカプセルを検索できます。';
        this.els.folderApplyImageBtn.disabled = true;
        this.els.folderImageGrid.innerHTML = '<p class="tool-note">画像を読み込み中...</p>';
        this.els.steamTrackPreviewList.innerHTML = '<p class="tool-note">読み込み中...</p>';
        this.els.steamBrowserGridView.hidden = true;
        this.els.steamBrowserDetailView.hidden = false;
        this.els.steamBackToGridBtn.disabled = false;
        await Promise.all([this.loadFolderImages(folderPath), this.loadFolderTracks(folderPath)]);
    }

    async loadFolderImages(folderPath) {
        try {
            const res = await fetch('/api/editor/folder-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder: folderPath }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                this.els.folderImageGrid.innerHTML = `<p class="tool-note">${this.escapeHtml(data.error || '画像の読み込みに失敗しました')}</p>`;
                return;
            }
            const localImages = (data.images || []).map((img) => {
                const encoded = img.path.split('/').map((s) => encodeURIComponent(s)).join('/');
                return {
                    source: 'local',
                    path: img.path,
                    name: img.name,
                    label: img.name,
                    imageUrl: `/api/editor/image/${encoded}`,
                };
            });
            this.folderLocalImageItems = localImages;
            this.folderAutoSteamImageItems = [];
            this.folderManualSteamImageItems = [];
            this.renderFolderImages(this.getCombinedFolderImages());
        } catch {
            this.els.folderImageGrid.innerHTML = '<p class="tool-note">画像の読み込みに失敗しました。</p>';
        }
    }

    getCombinedFolderImages() {
        const all = [
            ...this.folderLocalImageItems,
            ...this.folderAutoSteamImageItems,
            ...this.folderManualSteamImageItems,
        ];
        const seen = new Set();
        return all.filter((item) => {
            const key = `${item.source}:${item.path}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    renderFolderImages(images) {
        const cards = [
            `<button class="folder-image-card folder-image-add-card" type="button" data-action="upload" title="画像を追加">
                <span class="material-icons-round">add</span>
                <span class="folder-image-label">画像を追加</span>
            </button>`,
            ...images.map((img) => `
                <button class="folder-image-card" data-source="${this.escapeHtml(img.source)}" data-path="${this.escapeHtml(img.path)}" type="button" title="${this.escapeHtml(img.label || img.path)}">
                    <img src="${this.escapeHtml(img.imageUrl)}" alt="${this.escapeHtml(img.name)}" loading="lazy">
                    <span class="folder-image-label">${this.escapeHtml(img.label || img.name)}</span>
                </button>
            `),
        ];

        this.els.folderImageGrid.innerHTML = cards.join('');

        this.els.folderImageGrid.querySelectorAll('.folder-image-card').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (btn.dataset.action === 'upload') {
                    this.openFolderImageUploadPicker();
                    return;
                }

                const source = btn.dataset.source || 'local';
                const selectedPath = btn.dataset.path || '';

                this.folderBrowserSelectedImage = source === 'local' ? selectedPath : '';
                this.folderBrowserSelectedSteamAppId = source === 'steam' ? selectedPath : '';
                this.els.folderImageGrid.querySelectorAll('.folder-image-card').forEach((b) => b.classList.remove('selected'));
                btn.classList.add('selected');
                if (source === 'steam') {
                    this.els.folderImageStatus.textContent = `選択中: Steam AppID ${selectedPath}`;
                } else {
                    this.els.folderImageStatus.textContent = `選択中: ${(selectedPath.split('/').pop() || selectedPath)}`;
                }
                this.els.folderApplyImageBtn.disabled = false;
            });
        });

        if (!images.length) {
            this.els.folderImageStatus.textContent = '画像がまだありません。+ から追加するかSteamカプセルを選択してください。';
        }
    }

    openFolderImageUploadPicker() {
        if (!this.selectedFolderPath) return;
        this.els.folderImageUploadInput.value = '';
        this.els.folderImageUploadInput.click();
    }

    async onFolderImageUploadSelected(e) {
        const file = e.target.files && e.target.files[0];
        if (!file || !this.selectedFolderPath) return;

        this.els.folderImageStatus.textContent = '画像をアップロード中...';
        this.els.folderApplyImageBtn.disabled = true;

        try {
            const form = new FormData();
            form.append('folder', this.selectedFolderPath);
            form.append('image', file);

            const res = await fetch('/api/editor/folder-image/upload', {
                method: 'POST',
                body: form,
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                this.els.folderImageStatus.textContent = `アップロード失敗: ${data.error || 'unknown error'}`;
                return;
            }

            this.els.folderImageStatus.textContent = `アップロード完了: ${data.image?.name || file.name}`;
            await this.loadFolderImages(this.selectedFolderPath);
        } catch {
            this.els.folderImageStatus.textContent = 'アップロードに失敗しました。';
        }
    }

    normalizeSteamMatchText(text) {
        return String(text || '')
            .toLowerCase()
            .replace(/original soundtrack/g, ' ')
            .replace(/soundtrack/g, ' ')
            .replace(/\bost\b/g, ' ')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    async ensureSteamSoundtrackAppsLoaded() {
        if (this.steamSoundtrackApps.length) return;
        try {
            const res = await fetch('/api/steam/candidates');
            if (!res.ok) return;
            const data = await res.json();
            const apps = Array.isArray(data.soundtrackApps) ? data.soundtrackApps : [];
            this.steamSoundtrackApps = apps.filter((a) => a && a.appid && a.title);
        } catch {
            // 非重大: Steam候補が取得できない環境はある
        }
    }

    async searchSteamCapsulesManual() {
        const qRaw = (this.els.folderSteamSearchInput.value || '').trim();
        if (!qRaw) {
            this.folderManualSteamImageItems = [];
            this.els.folderSteamSearchStatus.textContent = '検索ワードを入力してください。';
            this.renderFolderImages(this.getCombinedFolderImages());
            return;
        }

        this.els.folderSteamSearchStatus.textContent = 'Steam候補を検索中...';
        await this.ensureSteamSoundtrackAppsLoaded();

        const q = qRaw.toLowerCase();
        const qToken = this.normalizeSteamMatchText(qRaw);

        const matches = this.steamSoundtrackApps.filter((app) => {
            const appid = String(app.appid || '');
            const title = String(app.title || '');
            const titleLower = title.toLowerCase();
            const titleToken = this.normalizeSteamMatchText(title);
            const byId = appid.includes(q);
            const byTitle = titleLower.includes(q);
            const byToken = !!qToken && (titleToken.includes(qToken) || qToken.includes(titleToken));
            return byId || byTitle || byToken;
        }).slice(0, 20);

        this.folderManualSteamImageItems = matches.map((app) => ({
            source: 'steam',
            path: String(app.appid),
            name: `Steam ${app.title}`,
            label: `Steam: ${app.title} (${app.appid})`,
            imageUrl: `/api/steam/cover/${encodeURIComponent(String(app.appid))}`,
        }));

        this.renderFolderImages(this.getCombinedFolderImages());
        this.els.folderSteamSearchStatus.textContent = `${this.folderManualSteamImageItems.length}件のSteam候補を追加表示しました。`;
    }

    async loadFolderTracks(folderPath) {
        const matching = this.tracks.filter((t) => this.isTrackInFolder(t, folderPath));
        if (!matching.length) {
            this.els.steamTrackPreviewList.innerHTML = '<p class="tool-note">このフォルダにトラックが見つかりません。</p>';
            return;
        }
        this.els.steamTrackPreviewList.innerHTML = matching.map((t, i) => `
            <div class="steam-track-row">
                <span>${i + 1}. ${this.escapeHtml(t.title || t.path || 'Track')}</span>
                <span>${this.formatTime(t.duration)}</span>
            </div>
        `).join('');
    }

    async applyFolderImage() {
        if ((!this.folderBrowserSelectedImage && !this.folderBrowserSelectedSteamAppId) || !this.selectedFolderPath) return;
        this.els.folderApplyImageBtn.disabled = true;
        this.els.folderImageStatus.textContent = '適用中...';
        try {
            const body = { folder: this.selectedFolderPath };
            if (this.folderBrowserSelectedSteamAppId) body.steamAppId = this.folderBrowserSelectedSteamAppId;
            else body.imagePath = this.folderBrowserSelectedImage;

            const res = await fetch('/api/editor/folder-image/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                this.els.folderImageStatus.textContent = `エラー: ${data.error || '適用に失敗しました'}`;
                this.els.folderApplyImageBtn.disabled = false;
                return;
            }
            this.els.folderImageStatus.textContent = `✓ 疑似アートを適用しました（対象: ${data.eligible || 0}曲）`;
            this.workspaceArtCache.clear();
            await this.loadTracks();
        } catch {
            this.els.folderImageStatus.textContent = '適用に失敗しました';
            this.els.folderApplyImageBtn.disabled = false;
        }
    }

    renderWorkspacePlaylistSelect() {
        this.els.workspacePlaylistSelect.innerHTML = [
            '<option value="">プレイリスト選択</option>',
            ...this.playlists.map((p) => `<option value="${this.escapeHtml(p.id)}">${this.escapeHtml(p.name)} (${p.count})</option>`),
        ].join('');

        if (this.workspacePlaylistId && this.playlists.some((p) => p.id === this.workspacePlaylistId)) {
            this.els.workspacePlaylistSelect.value = this.workspacePlaylistId;
        }
    }

    async workspaceCreatePlaylist() {
        const name = (this.els.workspaceNewPlaylistName.value || '').trim();
        if (!name) {
            this.setWorkspaceStatus('プレイリスト名を入力してください', true);
            return;
        }

        try {
            const res = await fetch('/api/playlists/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, tracks: [] }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                this.setWorkspaceStatus(data.error || '作成に失敗しました', true);
                return;
            }

            this.els.workspaceNewPlaylistName.value = '';
            await this.loadPlaylists();
            this.renderWorkspacePlaylistSelect();
            await this.workspaceSelectPlaylist(data.playlist.id);
            this.setWorkspaceStatus(`作成しました: ${data.playlist.name}`);
        } catch {
            this.setWorkspaceStatus('作成に失敗しました', true);
        }
    }

    async workspaceSelectPlaylist(playlistId) {
        this.workspacePlaylistId = playlistId;
        this.els.workspacePlaylistSelect.value = playlistId;

        if (!playlistId) {
            this.workspacePlaylistData = { tracks: [] };
            this.els.workspaceSavePlaylistBtn.disabled = true;
            this.els.workspaceDeletePlaylistBtn.disabled = true;
            this.renderWorkspaceLibrary();
            this.renderWorkspaceCurrentItems();
            return;
        }

        const encoded = playlistId.split('/').map((s) => encodeURIComponent(s)).join('/');
        try {
            const res = await fetch(`/api/playlists/${encoded}/raw`);
            if (!res.ok) {
                const errText = await res.text().catch(() => '');
                console.error('Playlist raw response:', res.status, errText);
                this.setWorkspaceStatus(`プレイリストの読み込みに失敗しました (${res.status})`, true);
                return;
            }
            const payload = await res.json();
            if (!payload.ok) {
                this.setWorkspaceStatus(payload.error || 'プレイリストの読み込みに失敗しました', true);
                return;
            }
            this.workspacePlaylistData = payload.playlist || { tracks: [] };
            this.els.workspaceSavePlaylistBtn.disabled = false;
            this.els.workspaceDeletePlaylistBtn.disabled = false;
            this.renderWorkspaceLibrary();
            this.renderWorkspaceCurrentItems();
            this.setWorkspaceStatus(`${this.workspacePlaylistData.name || 'プレイリスト'}を読み込みました`);
        } catch (err) {
            console.error('Playlist load error:', err);
            this.setWorkspaceStatus('プレイリストの読み込みに失敗しました (接続エラー)', true);
        }
    }

    renderWorkspaceLibrary() {
        const keyword = (this.els.workspaceLibrarySearchInput.value || '').toLowerCase().trim();
        const selected = new Set(this.workspacePlaylistData.tracks || []);
        const list = this.tracks.filter((t) => {
            if (!keyword) return true;
            const bag = `${t.title || ''} ${t.artist || ''} ${t.album || ''} ${t.path || ''}`.toLowerCase();
            return bag.includes(keyword);
        });

        this.els.workspaceLibraryList.innerHTML = list.map((track) => {
            const subtitle = `${track.artist || 'Unknown Artist'} / ${track.album || 'Unknown Album'}`;
            return `
                <label class="workspace-row">
                    <div class="playlist-item">
                        <div class="playlist-item-art" data-art-path="${this.escapeHtml(track.path)}">
                            <span class="material-icons-round">music_note</span>
                        </div>
                        <div class="playlist-item-info">
                            <div class="playlist-item-title">${this.escapeHtml(track.title)}</div>
                            <div class="playlist-item-artist">${this.escapeHtml(subtitle)}</div>
                        </div>
                        <div class="playlist-item-duration">${this.formatTime(track.duration)}</div>
                    </div>
                    <input type="checkbox" data-path="${this.escapeHtml(track.path)}" ${selected.has(track.path) ? 'checked' : ''} ${this.workspacePlaylistId ? '' : 'disabled'}>
                </label>
            `;
        }).join('');

        this.els.workspaceLibraryList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
            cb.addEventListener('change', () => {
                if (!this.workspacePlaylistId) return;
                const set = new Set(this.workspacePlaylistData.tracks || []);
                if (cb.checked) set.add(cb.dataset.path);
                else set.delete(cb.dataset.path);
                this.workspacePlaylistData.tracks = [...set];
                this.renderWorkspaceCurrentItems();
            });
        });

        this.loadWorkspaceArtwork(this.els.workspaceLibraryList);
    }

    renderWorkspaceCurrentItems() {
        if (!this.workspacePlaylistId) {
            this.els.workspacePlaylistItems.innerHTML = '<p class="tool-note">プレイリストを選択してください</p>';
            return;
        }

        const items = (this.workspacePlaylistData.tracks || []).map((path) => {
            const t = this.workspaceTrackMap.get(path);
            return {
                path,
                title: t?.title || path,
                subtitle: t ? `${t.artist || 'Unknown Artist'} / ${t.album || 'Unknown Album'}` : path,
                duration: t?.duration || 0,
            };
        });

        if (!items.length) {
            this.els.workspacePlaylistItems.innerHTML = '<p class="tool-note">まだ項目がありません</p>';
            return;
        }

        this.els.workspacePlaylistItems.innerHTML = items.map((item) => `
            <div class="workspace-row">
                <div class="playlist-item">
                    <div class="playlist-item-art" data-art-path="${this.escapeHtml(item.path)}">
                        <span class="material-icons-round">music_note</span>
                    </div>
                    <div class="playlist-item-info">
                        <div class="playlist-item-title">${this.escapeHtml(item.title)}</div>
                        <div class="playlist-item-artist">${this.escapeHtml(item.subtitle)}</div>
                    </div>
                    <div class="playlist-item-duration">${this.formatTime(item.duration)}</div>
                </div>
                <button class="workspace-remove" data-path="${this.escapeHtml(item.path)}" type="button">×</button>
            </div>
        `).join('');

        this.els.workspacePlaylistItems.querySelectorAll('.workspace-remove').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.workspacePlaylistData.tracks = (this.workspacePlaylistData.tracks || []).filter((p) => p !== btn.dataset.path);
                this.renderWorkspaceLibrary();
                this.renderWorkspaceCurrentItems();
            });
        });

        this.loadWorkspaceArtwork(this.els.workspacePlaylistItems);
    }

    async loadWorkspaceArtwork(root) {
        const holders = root.querySelectorAll('.playlist-item-art[data-art-path]');
        for (const holder of holders) {
            if (holder.dataset.loaded === '1') continue;
            const path = holder.dataset.artPath;
            const track = this.workspaceTrackMap.get(path);
            if (!track || !track.hasArt) continue;

            const dataUrl = await this.getWorkspaceArt(path);
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

    async getWorkspaceArt(path) {
        if (this.workspaceArtCache.has(path)) return this.workspaceArtCache.get(path);
        try {
            const res = await fetch(`/api/art/${path.split('/').map((s) => encodeURIComponent(s)).join('/')}`);
            if (!res.ok) {
                this.workspaceArtCache.set(path, '');
                return '';
            }
            const art = await res.json();
            const dataUrl = `data:${art.mime};base64,${art.data}`;
            this.workspaceArtCache.set(path, dataUrl);
            return dataUrl;
        } catch {
            this.workspaceArtCache.set(path, '');
            return '';
        }
    }

    async workspaceSavePlaylist() {
        if (!this.workspacePlaylistId) return;
        try {
            const res = await fetch('/api/playlists/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playlistId: this.workspacePlaylistId,
                    tracks: this.workspacePlaylistData.tracks || [],
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                this.setWorkspaceStatus(data.error || '保存に失敗しました', true);
                return;
            }

            await this.loadPlaylists();
            this.renderWorkspacePlaylistSelect();
            if (this.selectedPlaylistId && this.selectedPlaylistId === this.workspacePlaylistId) {
                await this.fetchPlaylistTracks(this.workspacePlaylistId);
                this.applyFiltersAndRender();
            }
            this.setWorkspaceStatus('プレイリストを保存しました');
        } catch {
            this.setWorkspaceStatus('保存に失敗しました', true);
        }
    }

    async workspaceDeletePlaylist() {
        if (!this.workspacePlaylistId) return;
        if (!window.confirm('このプレイリストを削除しますか？')) return;

        const deletingId = this.workspacePlaylistId;
        const encoded = deletingId.split('/').map((s) => encodeURIComponent(s)).join('/');
        try {
            const res = await fetch(`/api/playlists/${encoded}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                this.setWorkspaceStatus(data.error || '削除に失敗しました', true);
                return;
            }

            this.workspacePlaylistId = '';
            this.workspacePlaylistData = { tracks: [] };
            await this.loadPlaylists();
            this.renderWorkspacePlaylistSelect();
            this.renderWorkspaceLibrary();
            this.renderWorkspaceCurrentItems();

            if (this.selectedPlaylistId === deletingId) {
                this.selectedPlaylistId = '';
                this.els.playlistSelect.value = '';
                this.playlistTracks = [];
                this.applyFiltersAndRender();
            }

            this.setWorkspaceStatus('プレイリストを削除しました');
        } catch {
            this.setWorkspaceStatus('削除に失敗しました', true);
        }
    }

    setWorkspaceStatus(message, isError = false) {
        this.els.workspaceStatus.textContent = message;
        this.els.workspaceStatus.style.color = isError ? 'var(--danger, #ff8f8f)' : 'var(--text-secondary)';
    }

    async loadPlaylists() {
        try {
            const res = await fetch('/api/playlists');
            if (!res.ok) return;
            this.playlists = await res.json();

            this.els.playlistSelect.innerHTML = ['<option value="">全て（ライブラリ）</option>',
                ...this.playlists.map((p) => `<option value="${this.escapeHtml(p.id)}">${this.escapeHtml(p.name)} (${p.count})</option>`)];

            if (this.selectedPlaylistId && this.playlists.some((p) => p.id === this.selectedPlaylistId)) {
                this.els.playlistSelect.value = this.selectedPlaylistId;
                await this.fetchPlaylistTracks(this.selectedPlaylistId);
            }
        } catch (err) {
            console.error('プレイリスト読み込みエラー:', err);
        }
    }

    async fetchPlaylistTracks(playlistId) {
        if (!playlistId) {
            this.playlistTracks = [];
            return;
        }
        try {
            const encoded = playlistId.split('/').map((s) => encodeURIComponent(s)).join('/');
            const res = await fetch(`/api/playlists/${encoded}`);
            if (!res.ok) {
                this.playlistTracks = [];
                return;
            }
            const payload = await res.json();
            this.playlistTracks = payload.tracks || [];
        } catch {
            this.playlistTracks = [];
        }
    }

    getSourceTracks() {
        if (this.selectedPlaylistId) {
            return this.playlistTracks;
        }
        return this.tracks;
    }

    async onPlaylistChange(playlistId) {
        this.selectedPlaylistId = playlistId;
        await this.fetchPlaylistTracks(playlistId);
        this.selectedFolder = '__all__';
        this.selectedAlbum = '__all__';
        this.applyFiltersAndRender();
    }

    onFolderFilterChange(value) {
        if (this.editorMode) {
            this.selectedFolder = value;
            this.editorSyncFolderTarget();
            this.editorApplyFilters();
            return;
        }
        this.selectedFolder = value;
        this.applyFiltersAndRender();
    }

    onAlbumFilterChange(value) {
        if (this.editorMode) {
            this.selectedAlbum = value;
            this.editorApplyFilters();
            return;
        }
        this.selectedAlbum = value;
        this.applyFiltersAndRender();
    }

    onSortChange(key, order) {
        this.sortKey = key;
        this.sortOrder = order;
        if (this.editorMode) {
            this.editorApplyFilters();
            return;
        }
        this.applyFiltersAndRender();
    }

    updateAlbumFilterOptions(sourceTracks) {
        const albums = Array.from(new Set(sourceTracks
            .map((t) => (t.album && t.album !== 'Unknown Album' ? t.album : 'Unknown Album'))
            .filter(Boolean)))
            .sort((a, b) => a.localeCompare(b, 'ja'));

        this.els.albumFilterSelect.innerHTML = [
            '<option value="__all__">すべてのアルバム</option>',
            ...albums.map((a) => `<option value="${this.escapeHtml(a)}">${this.escapeHtml(a)}</option>`),
        ].join('');

        if (this.selectedAlbum !== '__all__' && albums.includes(this.selectedAlbum)) {
            this.els.albumFilterSelect.value = this.selectedAlbum;
        } else {
            this.selectedAlbum = '__all__';
            this.els.albumFilterSelect.value = '__all__';
        }
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

    updateFolderFilterOptions(sourceTracks) {
        const folders = Array.from(new Set(sourceTracks
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

    parseSearchTokens(query) {
        return query
            .trim()
            .split(/\s+/)
            .map((t) => t.trim())
            .filter(Boolean);
    }

    matchesAdvancedSearch(track, query) {
        const q = (query || '').toLowerCase().trim();
        if (!q) return true;

        const tokens = this.parseSearchTokens(q);
        const bag = [
            track.title,
            track.artist,
            track.album,
            track.genre,
            track.year,
            track.codec,
            track.path,
        ].map((v) => String(v || '').toLowerCase()).join(' ');

        const fieldMap = {
            title: String(track.title || '').toLowerCase(),
            artist: String(track.artist || '').toLowerCase(),
            album: String(track.album || '').toLowerCase(),
            genre: String(track.genre || '').toLowerCase(),
            year: String(track.year || '').toLowerCase(),
            codec: String(track.codec || '').toLowerCase(),
            path: String(track.path || '').toLowerCase(),
        };

        return tokens.every((token) => {
            const colonPos = token.indexOf(':');
            if (colonPos > 0) {
                const key = token.slice(0, colonPos);
                const value = token.slice(colonPos + 1);
                if (!value) return true;
                const target = fieldMap[key];
                if (target !== undefined) {
                    return target.includes(value);
                }
            }
            return bag.includes(token);
        });
    }

    getSortValue(track, key) {
        if (key === 'duration' || key === 'bitrateKbps') {
            return Number(track[key] || 0);
        }
        if (key === 'year') {
            const n = parseInt(track.year, 10);
            return Number.isNaN(n) ? 0 : n;
        }
        return String(track[key] || '').toLowerCase();
    }

    applyFiltersAndRender() {
        const sourceTracks = this.getSourceTracks();
        this.updateFolderFilterOptions(sourceTracks);
        this.updateAlbumFilterOptions(sourceTracks);

        const query = this.els.searchInput.value || '';

        let list = sourceTracks.filter((track) => {
            if (!this.isTrackInFolder(track, this.selectedFolder)) {
                return false;
            }
            if (this.selectedAlbum !== '__all__') {
                const album = track.album && track.album !== 'Unknown Album' ? track.album : 'Unknown Album';
                if (album !== this.selectedAlbum) return false;
            }
            return this.matchesAdvancedSearch(track, query);
        });

        list = list.slice().sort((a, b) => {
            const av = this.getSortValue(a, this.sortKey);
            const bv = this.getSortValue(b, this.sortKey);
            let result = 0;
            if (typeof av === 'number' && typeof bv === 'number') {
                result = av - bv;
            } else {
                result = String(av).localeCompare(String(bv), 'ja');
            }
            return this.sortOrder === 'desc' ? -result : result;
        });

        this.filteredTracks = list;
        this.renderPlaylist();
        this.els.trackCount.textContent = `${this.filteredTracks.length} 曲`;
        if (this.isShuffle) {
            this.generateShuffleQueue();
        }
    }

    async setInitialBackgroundFromArtwork() {
        const firstWithArt = this.tracks.find((track) => track.hasArt);
        if (!firstWithArt) return;

        const artUrl = this.buildArtUrl(firstWithArt);
        try {
            const res = await fetch(artUrl);
            if (!res.ok) return;
            const art = await res.json();
            const dataUrl = `data:${art.mime};base64,${art.data}`;
            this.els.bgArtwork.style.backgroundImage = `url(${dataUrl})`;
            this.els.bgArtwork.classList.add('active');
        } catch {
            // 背景用の先読み失敗は無視
        }
    }

    buildThemes() {
        return {
            'midnight-bloom': {
                bodyBg: 'radial-gradient(120% 120% at 40% 0%, #20204a 0%, #101019 45%, #09090d 100%)',
                accent: '#7c5cfc', accentLight: '#9d84fd',
                accentGradient: 'linear-gradient(135deg, #7c5cfc, #c084fc)',
                vTop: 'rgba(196, 176, 255, 0.9)', vMid: 'rgba(152, 122, 255, 0.7)', vBottom: 'rgba(120, 96, 224, 0.3)', vLine: 'rgba(168, 148, 255, 0.2)', vGlow: 'rgba(124, 92, 252, 0.14)',
            },
            'amber-noir': {
                bodyBg: 'radial-gradient(120% 120% at 40% 0%, #46311c 0%, #1f1711 45%, #0c0a09 100%)',
                accent: '#df8f2a', accentLight: '#f5b35b',
                accentGradient: 'linear-gradient(135deg, #df8f2a, #f0b44b)',
                vTop: 'rgba(255, 211, 140, 0.9)', vMid: 'rgba(244, 167, 74, 0.7)', vBottom: 'rgba(173, 104, 23, 0.3)', vLine: 'rgba(255, 196, 108, 0.22)', vGlow: 'rgba(233, 146, 45, 0.14)',
            },
            'ocean-glass': {
                bodyBg: 'radial-gradient(120% 120% at 40% 0%, #1a4b5a 0%, #0d1f28 45%, #071016 100%)',
                accent: '#31a9c8', accentLight: '#6bcde3',
                accentGradient: 'linear-gradient(135deg, #31a9c8, #5ec4de)',
                vTop: 'rgba(163, 236, 249, 0.9)', vMid: 'rgba(86, 197, 225, 0.7)', vBottom: 'rgba(39, 120, 139, 0.3)', vLine: 'rgba(130, 225, 244, 0.2)', vGlow: 'rgba(59, 179, 208, 0.13)',
            },
            'forest-ink': {
                bodyBg: 'radial-gradient(120% 120% at 40% 0%, #26453d 0%, #10231f 45%, #08110f 100%)',
                accent: '#3db384', accentLight: '#69ce9f',
                accentGradient: 'linear-gradient(135deg, #3db384, #8ad28a)',
                vTop: 'rgba(175, 247, 208, 0.9)', vMid: 'rgba(103, 218, 165, 0.72)', vBottom: 'rgba(54, 131, 97, 0.32)', vLine: 'rgba(140, 236, 183, 0.22)', vGlow: 'rgba(81, 191, 140, 0.12)',
            },
            'rose-smoke': {
                bodyBg: 'radial-gradient(120% 120% at 40% 0%, #5a2d40 0%, #2a1821 45%, #120b0f 100%)',
                accent: '#d76793', accentLight: '#ea9db9',
                accentGradient: 'linear-gradient(135deg, #d76793, #d67ca6)',
                vTop: 'rgba(255, 196, 221, 0.9)', vMid: 'rgba(234, 134, 178, 0.72)', vBottom: 'rgba(152, 69, 104, 0.3)', vLine: 'rgba(243, 166, 200, 0.2)', vGlow: 'rgba(214, 108, 152, 0.13)',
            },
            'slate-copper': {
                bodyBg: 'radial-gradient(120% 120% at 40% 0%, #41454f 0%, #1d2128 45%, #0d0f12 100%)',
                accent: '#c47a50', accentLight: '#d89b76',
                accentGradient: 'linear-gradient(135deg, #c47a50, #d6a074)',
                vTop: 'rgba(246, 205, 177, 0.9)', vMid: 'rgba(209, 141, 98, 0.72)', vBottom: 'rgba(122, 78, 49, 0.32)', vLine: 'rgba(227, 164, 123, 0.2)', vGlow: 'rgba(190, 124, 80, 0.13)',
            },
            'aurora-mint': {
                bodyBg: 'radial-gradient(120% 120% at 40% 0%, #1f3d4b 0%, #101b24 45%, #080d12 100%)',
                accent: '#4bcfb6', accentLight: '#88e7d7',
                accentGradient: 'linear-gradient(135deg, #4bcfb6, #6bcfdf)',
                vTop: 'rgba(191, 255, 240, 0.9)', vMid: 'rgba(106, 233, 206, 0.72)', vBottom: 'rgba(49, 137, 124, 0.3)', vLine: 'rgba(154, 249, 228, 0.22)', vGlow: 'rgba(87, 213, 190, 0.13)',
            },
            'mono-paper': {
                bodyBg: 'radial-gradient(120% 120% at 40% 0%, #f2f0ea 0%, #d8d4cb 45%, #bcb7ae 100%)',
                accent: '#494949', accentLight: '#676767',
                accentGradient: 'linear-gradient(135deg, #4f4f4f, #7a7a7a)',
                vTop: 'rgba(70, 70, 70, 0.72)', vMid: 'rgba(88, 88, 88, 0.52)', vBottom: 'rgba(64, 64, 64, 0.24)', vLine: 'rgba(72, 72, 72, 0.28)', vGlow: 'rgba(80, 80, 80, 0.1)',
            },
            'sunset-cinema': {
                bodyBg: 'radial-gradient(120% 120% at 40% 0%, #5a2233 0%, #26131b 45%, #12090d 100%)',
                accent: '#f36c46', accentLight: '#ff9a79',
                accentGradient: 'linear-gradient(135deg, #f36c46, #f3a33d)',
                vTop: 'rgba(255, 203, 167, 0.9)', vMid: 'rgba(255, 141, 96, 0.72)', vBottom: 'rgba(168, 78, 46, 0.31)', vLine: 'rgba(255, 160, 118, 0.24)', vGlow: 'rgba(244, 116, 74, 0.14)',
            },
            'blueprint-neon': {
                bodyBg: 'radial-gradient(120% 120% at 40% 0%, #133060 0%, #0a1933 45%, #050d1d 100%)',
                accent: '#2f8fff', accentLight: '#70b3ff',
                accentGradient: 'linear-gradient(135deg, #2f8fff, #4a60ff)',
                vTop: 'rgba(180, 216, 255, 0.9)', vMid: 'rgba(98, 156, 255, 0.72)', vBottom: 'rgba(52, 79, 176, 0.32)', vLine: 'rgba(132, 181, 255, 0.23)', vGlow: 'rgba(74, 132, 255, 0.13)',
            },
            'cover-reactive': {
                bodyBg: 'radial-gradient(120% 120% at 40% 0%, #1f2231 0%, #121521 45%, #0a0c14 100%)',
                accent: '#7ea4ff', accentLight: '#a0bcff',
                accentGradient: 'linear-gradient(135deg, #6d8fff, #8a7dff)',
                vTop: 'rgba(188, 205, 255, 0.9)', vMid: 'rgba(132, 160, 255, 0.72)', vBottom: 'rgba(78, 102, 189, 0.32)', vLine: 'rgba(156, 177, 255, 0.24)', vGlow: 'rgba(118, 146, 255, 0.14)',
                reactiveArtwork: true,
            },
        };
    }

    initTheme() {
        const savedTheme = localStorage.getItem('musicplayer-theme') || 'midnight-bloom';
        if (this.els.themeSelect) {
            this.els.themeSelect.value = savedTheme;
        }
        this.applyThemeByKey(savedTheme);
    }

    applyThemeByKey(themeKey) {
        const theme = this.themes[themeKey] || this.themes['midnight-bloom'];
        const root = document.documentElement;
        root.style.setProperty('--body-bg', theme.bodyBg);
        root.style.setProperty('--accent', theme.accent);
        root.style.setProperty('--accent-light', theme.accentLight);
        root.style.setProperty('--accent-gradient', theme.accentGradient);
        root.style.setProperty('--accent-glow', theme.vGlow);
        root.style.setProperty('--visualizer-top', theme.vTop);
        root.style.setProperty('--visualizer-mid', theme.vMid);
        root.style.setProperty('--visualizer-bottom', theme.vBottom);
        root.style.setProperty('--visualizer-line', theme.vLine);
        root.style.setProperty('--visualizer-glow', theme.vGlow);

        this.currentTheme = theme;
        this.currentThemeKey = themeKey;
        this.reactiveColorsFromArtwork = null;
        if (this.els.themeSelect) {
            this.els.themeSelect.value = themeKey;
        }

        if (theme.reactiveArtwork) {
            const currentArt = this.els.artworkImage && this.els.artworkImage.src;
            if (currentArt) {
                this.applyReactiveVisualizerFromArtwork(currentArt);
            }
        }

        localStorage.setItem('musicplayer-theme', themeKey);
        this.drawVisualizerIdle();
    }

    renderPlaylist() {
        const list = this.filteredTracks;

        if (list.length === 0) {
            const hasFilter = this.selectedFolder !== '__all__' || this.selectedAlbum !== '__all__' || Boolean((this.els.searchInput.value || '').trim());
            const message = hasFilter
                ? '現在の検索・フォルダ・アルバム条件に一致する曲がありません。'
                : '音楽ファイルが見つかりません。以下のフォルダに音楽ファイルを追加してください。';
            this.els.playlist.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons-round">library_music</span>
                    <p>${this.escapeHtml(message)}</p>
                    <span class="folder-path">music/</span>
                </div>`;
            return;
        }

        this.els.playlist.innerHTML = list.map((track, idx) => {
            const isActive = idx === this.currentQueuePos;
            const subtitleParts = [];
            if (track.artist && track.artist !== 'Unknown Artist') subtitleParts.push(track.artist);
            if (track.album && track.album !== 'Unknown Album') subtitleParts.push(track.album);
            const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' / ') : (track.codec || 'Unknown');
            const folderName = track.path && track.path.includes('/') ? track.path.split('/')[0] : '';
            return `
            <div class="playlist-item ${isActive ? 'active' : ''}"
                 data-queue-pos="${idx}">
                <div class="playlist-item-art">
                    <span class="material-icons-round">music_note</span>
                    <div class="playing-indicator">
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                    </div>
                </div>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${this.escapeHtml(track.title)}</div>
                    <div class="playlist-item-artist">${this.escapeHtml(subtitle)}</div>
                    ${folderName ? `<div class="playlist-item-folder">${this.escapeHtml(folderName)}</div>` : ''}
                </div>
                <div class="playlist-item-duration">${this.formatTime(track.duration)}</div>
            </div>`;
        }).join('');

        // プレイリストのサムネイル読み込み
        this.loadPlaylistArt();
    }

    async loadPlaylistArt() {
        const items = this.els.playlist.querySelectorAll('.playlist-item');
        for (const item of items) {
            const queuePos = parseInt(item.dataset.queuePos, 10);
            const track = this.filteredTracks[queuePos];
            if (!track) continue;

            if (track.hasArt) {
                try {
                    const res = await fetch(this.buildArtUrl(track));
                    if (res.ok) {
                        const art = await res.json();
                        const artEl = item.querySelector('.playlist-item-art');
                        const iconEl = artEl.querySelector('.material-icons-round');
                        if (iconEl) {
                            const img = document.createElement('img');
                            img.src = `data:${art.mime};base64,${art.data}`;
                            img.alt = '';
                            artEl.insertBefore(img, iconEl);
                            iconEl.style.display = 'none';
                        }
                    }
                } catch {
                    // アート読み込み失敗は無視
                }
            }
        }
    }

    // ========================================
    // 再生制御
    // ========================================

    async playTrackByQueuePos(queuePos) {
        const track = this.filteredTracks[queuePos];
        if (!track) return;

        this.currentQueuePos = queuePos;
        this.currentTrack = track;

        const realIndex = this.pathToIndex.get(track.path);
        if (realIndex === undefined) return;
        this.currentIndex = realIndex;
        await this.playTrack(realIndex);
    }

    async playTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;

        this.currentIndex = index;
        const track = this.tracks[index];
        this.currentTrack = track;

        if (this.currentQueuePos < 0) {
            const byPath = this.filteredTracks.findIndex((t) => t.path === track.path);
            this.currentQueuePos = byPath;
        }

        // オーディオソース設定
        this.audio.src = this.buildMusicUrl(track);
        this.audio.load();

        // UI更新
        this.els.trackTitle.textContent = track.title;
        this.els.trackArtist.textContent = track.artist;
        this.els.trackAlbum.textContent = track.album !== 'Unknown Album' ? track.album : '';
        this.els.trackFolder.textContent = track.path && track.path.includes('/') ? track.path.split('/')[0] : '';
        this.renderNowPlayingMeta(track);

        // アルバムアート
        await this.loadArtwork(track);

        // 再生
        try {
            await this.audio.play();
            this.isPlaying = true;
            await this.startVisualizer();
            this.updatePlayButton();
            this.updateActiveItem();
        } catch (err) {
            console.error('再生エラー:', err);
        }
    }

    async loadArtwork(track) {
        if (track.hasArt) {
            try {
                const res = await fetch(this.buildArtUrl(track));
                if (res.ok) {
                    const art = await res.json();
                    const dataUrl = `data:${art.mime};base64,${art.data}`;
                    this.els.artworkImage.src = dataUrl;
                    this.els.artworkImage.style.display = 'block';
                    this.els.artworkDefault.style.display = 'none';
                    this.els.bgArtwork.style.backgroundImage = `url(${dataUrl})`;
                    this.els.bgArtwork.classList.add('active');
                    if (this.currentTheme && this.currentTheme.reactiveArtwork) {
                        this.applyReactiveVisualizerFromArtwork(dataUrl);
                    }
                    return;
                }
            } catch {
                // フォールバック
            }
        }

        this.els.artworkImage.style.display = 'none';
        this.els.artworkDefault.style.display = 'flex';
        this.els.bgArtwork.classList.remove('active');
        if (this.currentTheme && this.currentTheme.reactiveArtwork) {
            this.applyThemeByKey('cover-reactive');
        }
    }

    async applyReactiveVisualizerFromArtwork(dataUrl) {
        try {
            const palette = await this.extractArtworkPalette(dataUrl);
            if (!palette) return;
            const root = document.documentElement;
            root.style.setProperty('--visualizer-top', palette.top);
            root.style.setProperty('--visualizer-mid', palette.mid);
            root.style.setProperty('--visualizer-bottom', palette.bottom);
            root.style.setProperty('--visualizer-line', palette.line);
            root.style.setProperty('--visualizer-glow', palette.glow);
            this.reactiveColorsFromArtwork = palette;
            this.drawVisualizerIdle();
        } catch {
            // ジャケット解析失敗時は既定色維持
        }
    }

    extractArtworkPalette(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                const w = 48;
                const h = 48;
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);
                const px = ctx.getImageData(0, 0, w, h).data;

                let sumR = 0;
                let sumG = 0;
                let sumB = 0;
                let count = 0;

                for (let i = 0; i < px.length; i += 4) {
                    const r = px[i];
                    const g = px[i + 1];
                    const b = px[i + 2];
                    const a = px[i + 3] / 255;
                    if (a < 0.4) continue;

                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const sat = max === 0 ? 0 : (max - min) / max;
                    const weight = 0.5 + sat * 1.8;

                    sumR += r * weight;
                    sumG += g * weight;
                    sumB += b * weight;
                    count += weight;
                }

                if (!count) {
                    resolve(null);
                    return;
                }

                const r = Math.round(sumR / count);
                const g = Math.round(sumG / count);
                const b = Math.round(sumB / count);

                const brighten = (v, amt) => Math.max(0, Math.min(255, Math.round(v + (255 - v) * amt)));
                const darken = (v, amt) => Math.max(0, Math.min(255, Math.round(v * (1 - amt))));

                const top = `rgba(${brighten(r, 0.52)}, ${brighten(g, 0.52)}, ${brighten(b, 0.52)}, 0.9)`;
                const mid = `rgba(${brighten(r, 0.24)}, ${brighten(g, 0.24)}, ${brighten(b, 0.24)}, 0.72)`;
                const bottom = `rgba(${darken(r, 0.36)}, ${darken(g, 0.36)}, ${darken(b, 0.36)}, 0.34)`;
                const line = `rgba(${brighten(r, 0.36)}, ${brighten(g, 0.36)}, ${brighten(b, 0.36)}, 0.24)`;
                const glow = `rgba(${r}, ${g}, ${b}, 0.14)`;

                resolve({ top, mid, bottom, line, glow });
            };
            img.onerror = () => resolve(null);
            img.src = dataUrl;
        });
    }

    togglePlay() {
        if (this.currentQueuePos === -1) {
            if (this.filteredTracks.length > 0) {
                this.playTrackByQueuePos(0);
            }
            return;
        }

        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        } else {
            this.audio.play();
            this.isPlaying = true;
            this.startVisualizer();
        }
        this.updatePlayButton();
    }

    nextTrack() {
        if (this.filteredTracks.length === 0) return;

        let nextQueuePos;
        if (this.isShuffle) {
            nextQueuePos = this.getShuffleNext();
        } else {
            const currentPos = this.currentQueuePos >= 0 ? this.currentQueuePos : 0;
            nextQueuePos = (currentPos + 1) % this.filteredTracks.length;
        }
        this.playTrackByQueuePos(nextQueuePos);
    }

    prevTrack() {
        if (this.filteredTracks.length === 0) return;

        // 3秒以上再生していたら最初に戻る
        const currentTime = this.audio.currentTime;
        if (currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }

        let prevQueuePos;
        if (this.isShuffle) {
            prevQueuePos = this.getShufflePrev();
        } else {
            const currentPos = this.currentQueuePos >= 0 ? this.currentQueuePos : 0;
            prevQueuePos = (currentPos - 1 + this.filteredTracks.length) % this.filteredTracks.length;
        }
        this.playTrackByQueuePos(prevQueuePos);
    }

    // ========================================
    // シャッフル
    // ========================================

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.els.btnShuffle.classList.toggle('active', this.isShuffle);
        if (this.isShuffle) {
            this.generateShuffleQueue();
        }
    }

    generateShuffleQueue() {
        this.shuffleQueue = [...Array(this.filteredTracks.length).keys()];
        // Fisher-Yates シャッフル
        for (let i = this.shuffleQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffleQueue[i], this.shuffleQueue[j]] = [this.shuffleQueue[j], this.shuffleQueue[i]];
        }
        this.shuffleIndex = this.shuffleQueue.indexOf(this.currentQueuePos);
        if (this.shuffleIndex < 0) this.shuffleIndex = 0;
    }

    getShuffleNext() {
        if (this.shuffleQueue.length === 0) this.generateShuffleQueue();
        this.shuffleIndex = (this.shuffleIndex + 1) % this.shuffleQueue.length;
        return this.shuffleQueue[this.shuffleIndex];
    }

    getShufflePrev() {
        if (this.shuffleQueue.length === 0) this.generateShuffleQueue();
        this.shuffleIndex = (this.shuffleIndex - 1 + this.shuffleQueue.length) % this.shuffleQueue.length;
        return this.shuffleQueue[this.shuffleIndex];
    }

    // ========================================
    // リピート
    // ========================================

    toggleRepeat() {
        this.repeatMode = (this.repeatMode + 1) % 3;
        const btn = this.els.btnRepeat;
        const icon = btn.querySelector('.material-icons-round');

        btn.classList.toggle('active', this.repeatMode > 0);
        icon.textContent = this.repeatMode === 2 ? 'repeat_one' : 'repeat';
    }

    onTrackEnd() {
        if (this.repeatMode === 2) {
            // 1曲リピート
            this.audio.currentTime = 0;
            this.audio.play();
        } else if (this.repeatMode === 1 || this.isShuffle) {
            this.nextTrack();
        } else {
            // リピートオフ: 最後の曲なら停止
            if (this.currentQueuePos < this.filteredTracks.length - 1) {
                this.nextTrack();
            } else {
                this.isPlaying = false;
                this.updatePlayButton();
            }
        }
    }

    // ========================================
    // シークバー
    // ========================================

    onTimeUpdate() {
        if (!this.audio.duration) return;

        const pct = (this.audio.currentTime / this.audio.duration) * 100;
        this.els.seekBar.value = pct;
        this.els.seekProgress.style.width = `${pct}%`;
        this.els.currentTime.textContent = this.formatTime(this.audio.currentTime);
    }

    onSeekInput(e) {
        const pct = e.target.value;
        this.els.seekProgress.style.width = `${pct}%`;
    }

    onSeekChange(e) {
        const pct = parseFloat(e.target.value);
        if (!this.audio.duration) return;
        this.audio.currentTime = (pct / 100) * this.audio.duration;
    }

    onMetadataLoaded() {
        this.els.totalTime.textContent = this.formatTime(this.audio.duration);
    }

    // ========================================
    // ボリューム
    // ========================================

    onVolumeInput(e) {
        this.setVolume(parseInt(e.target.value));
    }

    setVolume(val) {
        this.audio.volume = val / 100;
        this.els.volumeBar.value = val;
        this.els.volumeProgress.style.width = `${val}%`;
        this.updateVolumeIcon(val);
        this._lastVolume = val;
    }

    toggleMute() {
        if (this.audio.volume > 0) {
            this._savedVolume = this.audio.volume * 100;
            this.setVolume(0);
        } else {
            this.setVolume(this._savedVolume || 80);
        }
    }

    updateVolumeIcon(val) {
        let icon = 'volume_up';
        if (val === 0) icon = 'volume_off';
        else if (val < 30) icon = 'volume_mute';
        else if (val < 70) icon = 'volume_down';
        this.els.volumeIcon.textContent = icon;
    }

    // ========================================
    // 検索
    // ========================================

    onSearch() {
        if (this.editorMode) {
            this.editorApplyFilters();
            return;
        }
        this.applyFiltersAndRender();
    }

    // ========================================
    // キーボードショートカット
    // ========================================

    onKeyDown(e) {
        // 入力系UIにフォーカス中はショートカットを無効化
        const active = document.activeElement;
        if (active) {
            const tag = (active.tagName || '').toUpperCase();
            const editable = active.isContentEditable
                || tag === 'INPUT'
                || tag === 'TEXTAREA'
                || tag === 'SELECT';
            if (editable) return;
        }

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (e.shiftKey) this.nextTrack();
                else if (this.audio.duration) {
                    this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 5);
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (e.shiftKey) this.prevTrack();
                else {
                    this.audio.currentTime = Math.max(0, this.audio.currentTime - 5);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.setVolume(Math.min(100, parseInt(this.els.volumeBar.value) + 5));
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.setVolume(Math.max(0, parseInt(this.els.volumeBar.value) - 5));
                break;
            case 'KeyM':
                this.toggleMute();
                break;
            case 'KeyS':
                this.toggleShuffle();
                break;
            case 'KeyR':
                this.toggleRepeat();
                break;
        }
    }

    // ========================================
    // UI更新
    // ========================================

    updatePlayButton() {
        this.els.playIcon.textContent = this.isPlaying ? 'pause' : 'play_arrow';
        this.els.artworkWrapper.classList.toggle('playing', this.isPlaying);
    }

    updateActiveItem() {
        this.els.playlist.querySelectorAll('.playlist-item').forEach(item => {
            const queuePos = parseInt(item.dataset.queuePos, 10);
            item.classList.toggle('active', queuePos === this.currentQueuePos);
        });

        // アクティブなアイテムまでスクロール
        const activeItem = this.els.playlist.querySelector('.playlist-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    toggleSidebar() {
        this.els.sidebar.classList.toggle('open');
    }

    renderNowPlayingMeta(track) {
        const chips = [];
        if (track.year) chips.push(track.year);
        if (track.genre) chips.push(track.genre);
        if (track.codec) chips.push(track.codec);
        if (track.bitrateKbps) chips.push(`${track.bitrateKbps} kbps`);
        if (track.trackNumber) chips.push(`Track ${track.trackNumber}`);

        this.els.trackMetaChips.innerHTML = chips
            .slice(0, 5)
            .map((chip) => `<span class="meta-chip">${this.escapeHtml(chip)}</span>`)
            .join('');

        const techParts = [];
        if (track.sampleRate) techParts.push(`${(track.sampleRate / 1000).toFixed(1)} kHz`);
        if (track.channels) techParts.push(`${track.channels} ch`);
        if (track.bitDepth) techParts.push(`${track.bitDepth} bit`);
        if (track.fileSizeMB) techParts.push(`${track.fileSizeMB} MB`);
        this.els.trackTech.textContent = techParts.join('  /  ');
    }

    async initVisualizer() {
        if (this.analyser || !this.els.visualizerCanvas) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        this.audioContext = new AudioCtx();
        this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.84;

        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        this.visualizerData = new Uint8Array(this.analyser.frequencyBinCount);
        this.resizeVisualizerCanvas();
    }

    async startVisualizer() {
        try {
            await this.initVisualizer();
            if (!this.analyser || !this.audioContext) return;
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            if (this.visualizerFrame) {
                cancelAnimationFrame(this.visualizerFrame);
            }
            this.drawVisualizerFrame();
        } catch {
            // ビジュアライザー初期化失敗時は無視
        }
    }

    resizeVisualizerCanvas() {
        const canvas = this.els.visualizerCanvas;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.drawVisualizerIdle();
    }

    drawVisualizerIdle() {
        const canvas = this.els.visualizerCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        ctx.clearRect(0, 0, w, h);
        const lineY = h * 0.82;
        const idleGrad = ctx.createLinearGradient(0, lineY, 0, h);
        idleGrad.addColorStop(0, this.cssVar('--visualizer-line', 'rgba(168, 148, 255, 0.2)'));
        idleGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = idleGrad;
        ctx.fillRect(0, lineY - 1, w, 2);
    }

    drawVisualizerFrame() {
        if (!this.analyser || !this.visualizerData) {
            this.drawVisualizerIdle();
            return;
        }

        this.analyser.getByteFrequencyData(this.visualizerData);
        const canvas = this.els.visualizerCanvas;
        const ctx = canvas.getContext('2d');
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const barCount = Math.max(70, Math.floor(w / 20));
        const pairCount = Math.floor(barCount / 2);
        const gap = 3;
        const barW = (w - gap * (barCount - 1)) / barCount;
        const centerX = w / 2;
        const baseY = h * 0.82;
        const maxUp = h * 0.3;
        const maxDown = h * 0.1;

        ctx.clearRect(0, 0, w, h);

        const glow = ctx.createRadialGradient(w * 0.5, h * 0.78, 10, w * 0.5, h * 0.78, h * 0.7);
        glow.addColorStop(0, this.cssVar('--visualizer-glow', 'rgba(124, 92, 252, 0.14)'));
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        for (let i = 0; i < pairCount; i++) {
            const normalized = i / Math.max(1, pairCount - 1);
            const eased = Math.pow(normalized, 1.75);
            const dataIndex = Math.min(this.visualizerData.length - 1, Math.floor(eased * (this.visualizerData.length - 1)));
            const value = this.visualizerData[dataIndex] / 255;
            const upH = Math.max(2, value * maxUp);
            const downH = Math.max(1, value * maxDown);
            const dist = (pairCount - 1 - i) * (barW + gap);
            const leftX = centerX - dist - barW;
            const rightX = centerX + dist;

            const grad = ctx.createLinearGradient(0, baseY - upH, 0, baseY + downH);
            grad.addColorStop(0, this.cssVar('--visualizer-top', 'rgba(196, 176, 255, 0.9)'));
            grad.addColorStop(0.65, this.cssVar('--visualizer-mid', 'rgba(152, 122, 255, 0.7)'));
            grad.addColorStop(1, this.cssVar('--visualizer-bottom', 'rgba(120, 96, 224, 0.3)'));
            ctx.fillStyle = grad;
            ctx.fillRect(leftX, baseY - upH, barW, upH + downH);
            ctx.fillRect(rightX, baseY - upH, barW, upH + downH);
        }

        ctx.fillStyle = this.cssVar('--visualizer-line', 'rgba(168, 148, 255, 0.16)');
        ctx.fillRect(0, baseY - 1, w, 2);

        if (!this.audio.paused && !this.audio.ended) {
            this.visualizerFrame = requestAnimationFrame(() => this.drawVisualizerFrame());
        } else {
            this.drawVisualizerIdle();
        }
    }

    cssVar(name, fallback = '') {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return v || fallback;
    }

    // ========================================
    // ユーティリティ
    // ========================================

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    encodeTrackPath(track) {
        const rawPath = track.path || track.filename;
        return rawPath
            .split('/')
            .filter(Boolean)
            .map((segment) => encodeURIComponent(segment))
            .join('/');
    }

    buildMusicUrl(track) {
        return `/music/${this.encodeTrackPath(track)}`;
    }

    buildArtUrl(track) {
        return `/api/art/${this.encodeTrackPath(track)}`;
    }

    // ============================================================
    // Editor Mode
    // ============================================================

    enterEditorMode() {
        this.editorMode = true;
        this.els.openEditorBtn.classList.add('active');
        this.els.openPlayerBtn.classList.remove('active');
        this.els.playerArea.classList.add('hidden');
        this.els.mainVisualizer.classList.add('hidden');
        // steamBrowserが開いていれば閉じる
        this.els.steamBrowser.classList.remove('open');
        // editorPanel表示
        this.els.editorPanel.removeAttribute('hidden');
        this.els.editorPanel.classList.add('open');
        this.editorUpdateMiniPlayer();
        this.editorLoadTracks();
    }

    exitEditorMode() {
        this.editorMode = false;
        this.els.openPlayerBtn.classList.add('active');
        this.els.openEditorBtn.classList.remove('active');
        this.els.playerArea.classList.remove('hidden');
        this.els.mainVisualizer.classList.remove('hidden');
        this.els.editorPanel.setAttribute('hidden', '');
        this.els.editorPanel.classList.remove('open');
        this.applyFiltersAndRender();
    }

    editorUpdateMiniPlayer() {
        if (this.currentTrack) {
            this.els.editorMiniTitle.textContent = this.currentTrack.title || this.currentTrack.filename || '---';
            this.els.editorMiniPlayIcon.textContent = this.isPlaying ? 'pause' : 'play_arrow';
            this.els.editorNowPlaying.removeAttribute('hidden');
        } else {
            this.els.editorNowPlaying.setAttribute('hidden', '');
        }
    }

    // ---- データ読み込み ----

    async editorLoadTracks() {
        try {
            const res = await fetch('/api/tracks');
            const data = await res.json();
            this.editorTracks = data.tracks || [];
        } catch (e) {
            this.editorTracks = [...this.tracks];
        }
        this.editorSelectedPaths.clear();
        this.editorCurrentTrack = null;
        this.editorUpdateBulkBar();
        this.editorSyncFolderTarget();
        this.editorApplyFilters();
        this.editorLoadTrackListArtwork();
    }

    async editorEnsureSteamAppsLoaded() {
        if (this.editorSteamAppsLoaded || this.editorSteamAppsLoading) return;
        this.editorSteamAppsLoading = true;
        try {
            const res = await fetch('/api/steam/apps');
            const data = await res.json();
            this.editorSteamApps = data.apps || [];
            this.editorSteamAppsLoaded = true;
        } catch (e) {
            this.editorSteamApps = [];
        }
        this.editorSteamAppsLoading = false;
        this.editorRenderSteamGameOptions();
    }

    editorRenderSteamGameOptions() {
        const q = (this.els.editorSteamGameSearchInput.value || '').toLowerCase();
        const apps = q
            ? this.editorSteamApps.filter((a) => a.name.toLowerCase().includes(q))
            : this.editorSteamApps;
        this.els.editorSteamGameSelect.innerHTML = [
            '<option value="">ゲームを選択</option>',
            ...apps.slice(0, 200).map((a) =>
                `<option value="${a.appid}">${this.escapeHtml(a.name)} (${a.appid})</option>`),
        ].join('');
    }

    // ---- フィルタ ----

    editorSyncFolderTarget() {
        const folder = this.selectedFolder;
        if (folder && folder !== '__all__') {
            this.els.editorFolderImageFolderInput.value = folder;
            this.els.editorFolderBulkTrackCount.textContent =
                `対象曲: ${this.editorTracks.filter((t) => this.editorIsTrackInFolder(t, folder)).length} 件`;
            this.els.editorApplyFolderBulkBtn.disabled = false;
        } else {
            this.els.editorFolderImageFolderInput.value = '';
            this.els.editorFolderBulkTrackCount.textContent = '対象曲: 0 件';
            this.els.editorApplyFolderBulkBtn.disabled = true;
        }
    }

    editorGetTrackFolder(track) {
        const p = track.path || track.filename || '';
        const parts = p.replace(/\\/g, '/').split('/').filter(Boolean);
        return parts.length >= 2 ? parts[parts.length - 2] : (parts[0] || '');
    }

    editorIsTrackInFolder(track, folder) {
        const p = (track.path || track.filename || '').replace(/\\/g, '/');
        const folderName = this.editorGetTrackFolder(track);
        return folderName === folder || p.includes(`/${folder}/`) || p.startsWith(`${folder}/`);
    }

    editorParseSortValue(track, key) {
        switch (key) {
            case 'title': return (track.title || track.filename || '').toLowerCase();
            case 'artist': return (track.artist || '').toLowerCase();
            case 'album': return (track.album || '').toLowerCase();
            case 'track_number': return parseInt(track.track_number, 10) || 0;
            case 'year': return parseInt(track.year, 10) || 0;
            case 'filename': return (track.filename || '').toLowerCase();
            default: return '';
        }
    }

    editorApplyFilters() {
        let result = [...this.editorTracks];
        const q = (this.els.searchInput.value || '').toLowerCase().trim();
        if (q) {
            result = result.filter((t) =>
                (t.title || '').toLowerCase().includes(q) ||
                (t.artist || '').toLowerCase().includes(q) ||
                (t.album || '').toLowerCase().includes(q) ||
                (t.filename || '').toLowerCase().includes(q));
        }
        const folder = this.selectedFolder;
        if (folder && folder !== '__all__') {
            result = result.filter((t) => this.editorIsTrackInFolder(t, folder));
        }
        const album = this.selectedAlbum;
        if (album && album !== '__all__') {
            result = result.filter((t) => (t.album || 'Unknown Album') === album);
        }
        // ソート
        const key = this.sortKey;
        const ord = this.sortOrder;
        result.sort((a, b) => {
            const va = this.editorParseSortValue(a, key);
            const vb = this.editorParseSortValue(b, key);
            if (va < vb) return ord === 'asc' ? -1 : 1;
            if (va > vb) return ord === 'asc' ? 1 : -1;
            return 0;
        });
        this.editorFiltered = result;
        this.editorRenderTrackList();
    }

    // ---- トラックリスト描画 ----

    editorRenderTrackList() {
        const list = this.editorFiltered;
        if (!list.length) {
            this.els.editorTrackPane.innerHTML = '<p class="tool-note" style="padding:8px">曲が見つかりません</p>';
            return;
        }
        this.els.editorTrackPane.innerHTML = list.map((t, i) => {
            const sel = this.editorSelectedPaths.has(t.path || t.filename);
            const active = this.editorCurrentTrack &&
                (this.editorCurrentTrack.path || this.editorCurrentTrack.filename) === (t.path || t.filename);
            return `<div class="editor-track-item${sel ? ' editor-selected' : ''}${active ? ' active' : ''}"
                        data-editor-index="${i}"
                        data-path="${this.escapeHtml(t.path || t.filename || '')}">
                <input class="editor-track-item-cb" type="checkbox" ${sel ? 'checked' : ''}
                       data-editor-index="${i}" tabindex="-1">
                <img class="editor-track-item-art" src="/static/img/placeholder.svg"
                     data-art-path="${this.escapeHtml(t.path || t.filename || '')}"
                     alt="" loading="lazy">
                <div class="editor-track-item-info">
                    <div class="editor-track-item-title">${this.escapeHtml(t.title || t.filename || '')}</div>
                    <div class="editor-track-item-sub">${this.escapeHtml(t.artist || this.editorGetTrackFolder(t))}</div>
                </div>
            </div>`;
        }).join('');
        this.editorLoadTrackListArtwork();
    }

    editorOnTrackListClick(e) {
        const cb = e.target.closest('.editor-track-item-cb');
        const item = e.target.closest('.editor-track-item');
        if (!item) return;
        const idx = parseInt(item.dataset.editorIndex, 10);
        if (Number.isNaN(idx)) return;
        const track = this.editorFiltered[idx];
        if (!track) return;
        const key = track.path || track.filename;

        if (cb) {
            // チェックボックスクリック
            if (e.shiftKey && this.editorLastClickedIndex >= 0) {
                this.editorShiftSelect(this.editorLastClickedIndex, idx);
            } else {
                if (this.editorSelectedPaths.has(key)) {
                    this.editorSelectedPaths.delete(key);
                } else {
                    this.editorSelectedPaths.add(key);
                }
            }
            this.editorLastClickedIndex = idx;
        } else {
            // 行クリック -> トラック読み込み
            this.editorLoadTrack(track);
        }
        this.editorUpdateBulkBar();
        this.editorRenderTrackList();
    }

    editorShiftSelect(from, to) {
        const mn = Math.min(from, to);
        const mx = Math.max(from, to);
        for (let i = mn; i <= mx; i++) {
            const t = this.editorFiltered[i];
            if (t) this.editorSelectedPaths.add(t.path || t.filename);
        }
    }

    editorSelectAll() {
        this.editorFiltered.forEach((t) => this.editorSelectedPaths.add(t.path || t.filename));
        this.editorUpdateBulkBar();
        this.editorRenderTrackList();
    }

    editorDeselectAll() {
        this.editorSelectedPaths.clear();
        this.editorUpdateBulkBar();
        this.editorRenderTrackList();
    }

    editorUpdateBulkBar() {
        const n = this.editorSelectedPaths.size;
        this.els.editorBulkCount.textContent = `${n} 件選択`;
        this.els.editorSelectionInfo.style.display = n > 0 ? '' : 'none';
    }

    // ---- アートワーク読み込み (トラックリスト) ----

    editorLoadTrackListArtwork() {
        const imgs = this.els.editorTrackPane.querySelectorAll('img[data-art-path]');
        imgs.forEach((img) => {
            const p = img.dataset.artPath;
            if (!p) return;
            if (this.editorArtCache.has(p)) {
                img.src = this.editorArtCache.get(p);
                return;
            }
            const track = this.editorTracks.find((t) => (t.path || t.filename) === p);
            if (!track) return;
            fetch(this.buildArtUrl(track))
                .then((r) => (r.ok ? r.blob() : null))
                .then((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        this.editorArtCache.set(p, url);
                        img.src = url;
                    }
                })
                .catch(() => { /* ignore */ });
        });
    }

    async editorGetArtDataUrl(track) {
        const p = track.path || track.filename;
        if (this.editorArtCache.has(p)) return this.editorArtCache.get(p);
        try {
            const res = await fetch(this.buildArtUrl(track));
            if (!res.ok) return null;
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            this.editorArtCache.set(p, url);
            return url;
        } catch (e) {
            return null;
        }
    }

    // ---- 単一トラック読み込み ----

    async editorLoadTrack(track) {
        this.editorCurrentTrack = track;
        this.editorPendingArtworkData = '';
        const filename = (track.path || track.filename || '').split('/').pop() || '';
        this.els.editorFileName.textContent = track.title || filename;
        this.els.editorFilePath.textContent = track.path || track.filename || '';
        this.els.editorTitle.value = track.title || '';
        this.els.editorArtist.value = track.artist || '';
        this.els.editorAlbum.value = track.album || '';
        this.els.editorAlbumArtist.value = track.album_artist || '';
        this.els.editorGenre.value = track.genre || '';
        this.els.editorYear.value = track.year || '';
        this.els.editorTrackNumber.value = track.track_number || '';
        this.els.editorDiscNumber.value = track.disc_number || '';
        this.els.editorSaveBtn.disabled = false;
        this.els.editorChooseArtworkBtn.disabled = false;
        this.els.editorStatusText.textContent = '';
        this.editorUpdateTechView(track);
        await this.editorLoadArtworkPreview(track);
    }

    editorUpdateTechView(track) {
        this.els.emCodec.textContent = track.codec || '-';
        this.els.emBitrate.textContent = track.bitrate ? `${Math.round(track.bitrate / 1000)} kbps` : '-';
        this.els.emSampleRate.textContent = track.sample_rate ? `${track.sample_rate / 1000} kHz` : '-';
        this.els.emChannels.textContent = track.channels || '-';
        this.els.emBitDepth.textContent = track.bits_per_sample || '-';
        this.els.emSize.textContent = track.file_size
            ? `${(track.file_size / 1048576).toFixed(1)} MB`
            : '-';
    }

    async editorLoadArtworkPreview(track) {
        const url = await this.editorGetArtDataUrl(track);
        if (url) {
            this.editorShowArtwork(url);
        } else {
            this.editorShowArtworkPlaceholder();
        }
        this.els.editorSaveArtworkBtn.disabled = !this.editorPendingArtworkData;
    }

    editorShowArtwork(url) {
        this.els.editorArtworkPreview.src = url;
        this.els.editorArtworkPreview.style.display = 'block';
        this.els.editorArtworkEmpty.style.display = 'none';
    }

    editorShowArtworkPlaceholder() {
        this.els.editorArtworkPreview.src = '';
        this.els.editorArtworkPreview.style.display = 'none';
        this.els.editorArtworkEmpty.style.display = 'flex';
    }

    editorOnArtworkSelected(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            this.editorPendingArtworkData = dataUrl;
            this.editorShowArtwork(dataUrl);
            this.els.editorSaveArtworkBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    async editorSaveArtwork() {
        if (!this.editorCurrentTrack || !this.editorPendingArtworkData) return;
        try {
            const res = await fetch('/api/editor/save_artwork', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: this.editorCurrentTrack.path || this.editorCurrentTrack.filename,
                    artwork_data: this.editorPendingArtworkData,
                }),
            });
            const data = await res.json();
            if (data.ok) {
                const p = this.editorCurrentTrack.path || this.editorCurrentTrack.filename;
                this.editorArtCache.delete(p);
                this.editorPendingArtworkData = '';
                this.els.editorSaveArtworkBtn.disabled = true;
                this.editorSetStatus(this.els.editorStatusText, 'ジャケット保存完了', true);
            } else {
                this.editorSetStatus(this.els.editorStatusText, data.error || 'エラー', false);
            }
        } catch (e) {
            this.editorSetStatus(this.els.editorStatusText, 'ネットワークエラー', false);
        }
    }

    async editorSaveCurrent() {
        if (!this.editorCurrentTrack) return;
        const payload = {
            path: this.editorCurrentTrack.path || this.editorCurrentTrack.filename,
            title: this.els.editorTitle.value,
            artist: this.els.editorArtist.value,
            album: this.els.editorAlbum.value,
            album_artist: this.els.editorAlbumArtist.value,
            genre: this.els.editorGenre.value,
            year: this.els.editorYear.value,
            track_number: this.els.editorTrackNumber.value,
            disc_number: this.els.editorDiscNumber.value,
        };
        try {
            const res = await fetch('/api/editor/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.ok) {
                Object.assign(this.editorCurrentTrack, payload);
                this.editorUpdateTrackInList(this.editorCurrentTrack);
                this.editorSetStatus(this.els.editorStatusText, '保存完了', true);
            } else {
                this.editorSetStatus(this.els.editorStatusText, data.error || '保存失敗', false);
            }
        } catch (e) {
            this.editorSetStatus(this.els.editorStatusText, 'ネットワークエラー', false);
        }
    }

    editorUpdateTrackInList(track) {
        const p = track.path || track.filename;
        const t = this.editorTracks.find((x) => (x.path || x.filename) === p);
        if (t) Object.assign(t, track);
        this.editorRenderTrackList();
    }

    // ---- 一括編集 ----

    editorShowBulkEdit() {
        if (this.editorSelectedPaths.size < 2) return;
        this.els.editorBulkEditCard.removeAttribute('hidden');
        const tracks = this.editorFiltered.filter((t) => this.editorSelectedPaths.has(t.path || t.filename));
        this.els.editorBulkArtist.value = this.editorGetCommonValue(tracks, 'artist');
        this.els.editorBulkAlbum.value = this.editorGetCommonValue(tracks, 'album');
        this.els.editorBulkAlbumArtist.value = this.editorGetCommonValue(tracks, 'album_artist');
        this.els.editorBulkGenre.value = this.editorGetCommonValue(tracks, 'genre');
        this.els.editorBulkYear.value = this.editorGetCommonValue(tracks, 'year');
        this.els.editorBulkDiscNumber.value = this.editorGetCommonValue(tracks, 'disc_number');
        this.els.editorBulkStatusText.textContent = '';
    }

    editorGetCommonValue(tracks, key) {
        const vals = [...new Set(tracks.map((t) => String(t[key] || '')))];
        return vals.length === 1 ? vals[0] : '';
    }

    editorHideBulkEdit() {
        this.els.editorBulkEditCard.setAttribute('hidden', '');
    }

    async editorApplyBulkEdit() {
        const tracks = this.editorFiltered.filter((t) => this.editorSelectedPaths.has(t.path || t.filename));
        const fields = {
            artist: this.els.editorBulkArtist.value,
            album: this.els.editorBulkAlbum.value,
            album_artist: this.els.editorBulkAlbumArtist.value,
            genre: this.els.editorBulkGenre.value,
            year: this.els.editorBulkYear.value,
            disc_number: this.els.editorBulkDiscNumber.value,
        };
        // 空フィールドは除外
        const nonEmpty = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== ''));
        if (!Object.keys(nonEmpty).length) {
            this.editorSetStatus(this.els.editorBulkStatusText, '変更フィールドがありません', false);
            return;
        }
        let ok = 0, fail = 0;
        for (const t of tracks) {
            try {
                const res = await fetch('/api/editor/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: t.path || t.filename, ...nonEmpty }),
                });
                const d = await res.json();
                if (d.ok) { Object.assign(t, nonEmpty); ok++; }
                else fail++;
            } catch (e) { fail++; }
        }
        this.editorSetStatus(this.els.editorBulkStatusText,
            `完了: ${ok} 件成功 / ${fail} 件失敗`, ok > 0);
        this.editorRenderTrackList();
    }

    // ---- 整理 ----

    editorShowOrganize() {
        this.els.editorOrganizeCard.removeAttribute('hidden');
        this.editorUpdateOrganizePresetView();
        this.editorEnsureSteamAppsLoaded();
    }

    editorHideOrganize() {
        this.els.editorOrganizeCard.setAttribute('hidden', '');
        this.els.editorOrganizePreview.innerHTML = '';
        this.els.editorOrganizeExecuteBtn.disabled = true;
    }

    editorUpdateOrganizePresetView() {
        const preset = this.els.editorOrganizePresetSelect.value;
        const isSteam = preset === 'steam';
        this.els.editorSteamOrganizeFields.hidden = !isSteam;
        this.els.editorDefaultFolderStructure.hidden = isSteam;
        this.els.editorSteamFolderStructure.hidden = !isSteam;
        this.els.editorOrganizeExecuteBtn.disabled = true;
        this.els.editorOrganizePreview.innerHTML = '';
    }

    editorSyncSteamGameSelection() {
        const appid = this.els.editorSteamGameSelect.value;
        this.els.editorSteamAppIdInput.value = appid;
    }

    async editorPreviewOrganize() {
        const tracks = this.editorFiltered.filter((t) => this.editorSelectedPaths.has(t.path || t.filename));
        if (!tracks.length) {
            this.editorSetStatus(this.els.editorOrganizeStatusText, '曲が選択されていません', false);
            return;
        }
        const preset = this.els.editorOrganizePresetSelect.value;
        const appid = preset === 'steam' ? this.els.editorSteamAppIdInput.value : '';
        try {
            const res = await fetch('/api/editor/organize_preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paths: tracks.map((t) => t.path || t.filename), preset, steam_appid: appid }),
            });
            const data = await res.json();
            if (data.preview) {
                this.els.editorOrganizePreview.innerHTML = data.preview.map((row) =>
                    `<div class="organize-row${row.skip ? ' organize-skipped' : ''}">
                        <span class="organize-from">${this.escapeHtml(row.from)}</span>
                        <span class="organize-arrow">→</span>
                        <span class="organize-to">${this.escapeHtml(row.to)}</span>
                    </div>`).join('');
                this.els.editorOrganizeExecuteBtn.disabled = data.preview.every((r) => r.skip);
                this.editorSetStatus(this.els.editorOrganizeStatusText, '', true);
            } else {
                this.editorSetStatus(this.els.editorOrganizeStatusText, data.error || 'エラー', false);
            }
        } catch (e) {
            this.editorSetStatus(this.els.editorOrganizeStatusText, 'ネットワークエラー', false);
        }
    }

    async editorExecuteOrganize() {
        const tracks = this.editorFiltered.filter((t) => this.editorSelectedPaths.has(t.path || t.filename));
        const preset = this.els.editorOrganizePresetSelect.value;
        const appid = preset === 'steam' ? this.els.editorSteamAppIdInput.value : '';
        try {
            const res = await fetch('/api/editor/organize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paths: tracks.map((t) => t.path || t.filename), preset, steam_appid: appid }),
            });
            const data = await res.json();
            if (data.ok) {
                this.editorSetStatus(this.els.editorOrganizeStatusText, `完了: ${data.moved} 件移動`, true);
                this.editorHideOrganize();
                await this.editorLoadTracks();
            } else {
                this.editorSetStatus(this.els.editorOrganizeStatusText, data.error || '失敗', false);
            }
        } catch (e) {
            this.editorSetStatus(this.els.editorOrganizeStatusText, 'ネットワークエラー', false);
        }
    }

    // ---- フォルダ一括適用 ----

    async editorApplyFolderBulkUpdate() {
        const folder = this.selectedFolder;
        if (!folder || folder === '__all__') return;
        const tracks = this.editorTracks.filter((t) => this.editorIsTrackInFolder(t, folder));
        const fields = {
            artist: this.els.editorFolderBulkArtist.value,
            album: this.els.editorFolderBulkAlbum.value,
            album_artist: this.els.editorFolderBulkAlbumArtist.value,
            genre: this.els.editorFolderBulkGenre.value,
            year: this.els.editorFolderBulkYear.value,
        };
        const nonEmpty = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== ''));
        if (!Object.keys(nonEmpty).length) {
            this.editorSetStatus(this.els.editorFolderBulkStatusText, '変更フィールドがありません', false);
            return;
        }
        let ok = 0, fail = 0;
        for (const t of tracks) {
            try {
                const res = await fetch('/api/editor/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: t.path || t.filename, ...nonEmpty }),
                });
                const d = await res.json();
                if (d.ok) { Object.assign(t, nonEmpty); ok++; } else fail++;
            } catch (e) { fail++; }
        }
        this.editorSetStatus(this.els.editorFolderBulkStatusText,
            `完了: ${ok} 件成功 / ${fail} 件失敗`, ok > 0);
        this.editorRenderTrackList();
    }

    // ---- フォルダ画像 ----

    async editorLoadFolderImagesForPreview() {
        const folder = this.selectedFolder;
        if (!folder || folder === '__all__') return;
        this.els.editorFolderImagePreviewGrid.innerHTML = '<p class="ed-status">読み込み中...</p>';
        try {
            const res = await fetch(`/api/folder_images?folder=${encodeURIComponent(folder)}`);
            const data = await res.json();
            const images = data.images || [];
            if (!images.length) {
                this.els.editorFolderImagePreviewGrid.innerHTML = '<p class="ed-status">画像が見つかりません</p>';
                return;
            }
            this.els.editorFolderImagePreviewGrid.innerHTML = images.map((img) =>
                `<div class="folder-image-card" data-path="${this.escapeHtml(img.path)}">
                    <img src="${this.escapeHtml(img.url)}" alt="${this.escapeHtml(img.name)}" loading="lazy">
                    <div class="folder-image-name">${this.escapeHtml(img.name)}</div>
                </div>`).join('');
            this.els.editorFolderImagePreviewGrid.querySelectorAll('.folder-image-card').forEach((card) => {
                card.addEventListener('click', () => {
                    this.els.editorFolderImagePreviewGrid.querySelectorAll('.folder-image-card')
                        .forEach((c) => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.editorSelectedFolderImagePath = card.dataset.path;
                    this.els.editorFolderImagePathInput.value = card.dataset.path;
                    this.els.editorApplyFolderImageBtn.disabled = false;
                });
            });
        } catch (e) {
            this.els.editorFolderImagePreviewGrid.innerHTML = '<p class="ed-status err">エラー</p>';
        }
    }

    async editorApplyCapsule() {
        const folder = this.selectedFolder;
        const imgPath = this.editorSelectedFolderImagePath;
        if (!folder || !imgPath) return;
        try {
            const res = await fetch('/api/editor/apply_folder_image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder, image_path: imgPath }),
            });
            const data = await res.json();
            if (data.ok) {
                this.editorSetStatus(this.els.editorFolderImageStatusText, `完了: ${data.updated} 件更新`, true);
                // アートキャッシュをクリア
                const tracks = this.editorTracks.filter((t) => this.editorIsTrackInFolder(t, folder));
                tracks.forEach((t) => this.editorArtCache.delete(t.path || t.filename));
                this.editorLoadTrackListArtwork();
            } else {
                this.editorSetStatus(this.els.editorFolderImageStatusText, data.error || '失敗', false);
            }
        } catch (e) {
            this.editorSetStatus(this.els.editorFolderImageStatusText, 'ネットワークエラー', false);
        }
    }

    // ---- ユーティリティ ----

    editorSetStatus(el, msg, ok) {
        el.textContent = msg;
        el.className = `ed-status${ok ? ' ok' : ' err'}`;
    }
}

// 初期化
const player = new MusicPlayer();
window.player = player;

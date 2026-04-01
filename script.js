const API_KEY_NAME = 'GEMINI_KEY';
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const setupView = document.getElementById('api-setup');
const chatView = document.getElementById('chat-interface');

function hasLegacyChatUI() {
    return chatMessages && userInput && setupView && chatView;
}

// ページ読み込み時にキーの有無をチェック
function checkStatus() {
    if (!hasLegacyChatUI()) return;

    const savedKey = localStorage.getItem(API_KEY_NAME);
    if (savedKey) {
        setupView.classList.add('hidden');
        chatView.classList.remove('hidden');
    } else {
        setupView.classList.remove('hidden');
        chatView.classList.add('hidden');
    }
}

// APIキーをローカルストレージに保存
function saveApiKey() {
    if (!hasLegacyChatUI()) return;

    const key = document.getElementById('api-key-input').value.trim();
    if (key) {
        localStorage.setItem(API_KEY_NAME, key);
        checkStatus();
    } else {
        alert("有効なAPIキーを入力してください。");
    }
}

// キーの削除とリセット
function clearApiKey() {
    if (confirm('保存されているAPIキーを削除してリセットしますか？')) {
        localStorage.removeItem(API_KEY_NAME);
        location.reload();
    }
}

// メッセージ送信処理
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // ユーザーのメッセージを表示
    appendMessage('NEO', text, 'bg-green-500/10 border-l-4 border-green-500 text-green-700 dark:text-green-400 font-bold');
    userInput.value = '';

    // ローディング（思考中）表示
    const loadingMsg = appendMessage('AI', 'Processing with Gemini 2.5 Flash...', 'text-slate-400 italic animate-pulse');

    if (!hasLegacyChatUI()) return;

    try {
        const apiKey = localStorage.getItem(API_KEY_NAME);
        if (!apiKey) throw new Error('APIキーが設定されていません。');

        // 2026年最新の v1 エンドポイントとモデル名
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `あなたはアドオン開発者「Neo」が運営するポータルサイトのサポートAIです。ユーザーの質問に簡潔かつ丁寧に答えてください。質問：${text}`
                    }]
                }]
            })
        });

        const data = await response.json();

        // エラーレスポンスの処理
        if (!response.ok) {
            throw new Error(data.error?.message || `HTTP Error ${response.status}`);
        }

        // AIの回答を抽出
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiResult = data.candidates[0].content.parts[0].text;
            loadingMsg.remove();
            appendMessage('AI', aiResult, 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300');
        } else {
            throw new Error("有効な回答を生成できませんでした。");
        }

    } catch (e) {
        console.error("API Error:", e);
        loadingMsg.innerHTML = `⚠️ ERROR: ${e.message}`;
        loadingMsg.classList.remove('animate-pulse');
        loadingMsg.classList.add('text-red-500', 'font-bold', 'bg-red-50', 'dark:bg-red-900/20', 'p-3', 'rounded-xl');
    }
}

// チャット画面にメッセージを追加する共通関数
function appendMessage(sender, text, className) {
    const div = document.createElement('div');
    div.className = `p-4 rounded-2xl transition-all shadow-sm ${className}`;
    div.innerHTML = `
        <span class="text-[9px] block opacity-40 mb-1 tracking-[0.2em] uppercase font-black">${sender}</span>
        <div class="whitespace-pre-wrap">${text}</div>
    `;
    chatMessages.appendChild(div);
    
    // メッセージ追加時に自動スクロール
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
    return div;
}

// 初期化実行
window.onload = checkStatus;
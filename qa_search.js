// ==============================
// 設定
// ==============================

// Cloud Run にデプロイした API の URL
// ※ 末尾の / は付けない
const API_BASE_URL = "https://YOUR-CLOUD-RUN-URL";

// API のパス
const API_PATH = "/search";

// ==============================
// 要素取得
// ==============================

const elQuery   = document.getElementById("query");
const elTopk    = document.getElementById("topk");
const elBtn     = document.getElementById("searchBtn");
const elStatus  = document.getElementById("status");
const elResults = document.getElementById("results");

// ==============================
// 共通処理
// ==============================

function setStatus(text) {
  elStatus.textContent = text || "";
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderResults(payload) {
  elResults.innerHTML = "";

  const results = payload?.results ?? [];
  const query   = payload?.query ?? "";

  setStatus(`検索クエリ: ${query} / 件数: ${results.length}`);

  if (results.length === 0) {
    elResults.innerHTML = `<div class="small">結果がありません。</div>`;
    return;
  }

  elResults.innerHTML = results.map(r => `
    <div class="item">
      <div class="meta">
        <span>rank: ${escapeHtml(r.rank)}</span>
        <span>score: ${escapeHtml(r.score)}</span>
        <span>qa_id: ${escapeHtml(r.qa_id)}</span>
      </div>
      <div class="q">質問：${escapeHtml(r.question)}</div>
      <div class="a">回答：${escapeHtml(r.answer)}</div>
    </div>
  `).join("");
}

// ==============================
// 検索処理
// ==============================

async function searchQA() {
  const query = elQuery.value.trim();
  const topK  = Number(elTopk.value);

  if (!query) {
    setStatus("検索キーワードを入力してください。");
    elResults.innerHTML = "";
    return;
  }

  elBtn.disabled = true;
  setStatus("検索中…");
  elResults.innerHTML = "";

  try {
    const url = new URL(API_BASE_URL + API_PATH);
    url.searchParams.set("query", query);
    url.searchParams.set("top_k", topK);

    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const payload = await res.json();
    renderResults(payload);

  } catch (err) {
    setStatus("エラーが発生しました。API 設定を確認してください。");
    elResults.innerHTML = `<pre class="small">${escapeHtml(err.message)}</pre>`;
  } finally {
    elBtn.disabled = false;
  }
}

// ==============================
// イベント
// ==============================

elBtn.addEventListener("click", searchQA);
elQuery.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    searchQA();
  }
});

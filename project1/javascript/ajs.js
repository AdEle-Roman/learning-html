/*注；以下的插入ai功能部分为ai帮忙书写，我只是非常好奇这个功能，所以才让ai帮我，并且尽力在理解*/

const genBtn = document.getElementById('genAI');
const sumInput = document.getElementById('aiSummary');
const tagInput = document.getElementById('aiTags');
if (!localStorage.getItem('DS_KEY')) {
  const key = prompt('请输入 DeepSeek API-Key（仅本地保存）');
  if (key) localStorage.setItem('DS_KEY', key);
}
genBtn.addEventListener('click', async () => {
  const title = form.resTitle.value.trim();
  const desc = form.resDesc.value.trim();
  if (!title || !desc) return alert('请先填标题和简介');

  genBtn.disabled = true;
  genBtn.textContent = '生成中…';

  const { summary, tags } = await callDeepSeek(title, desc);

  sumInput.value = summary;
  tagInput.value = tags.join(' / ');
  genBtn.disabled = false;
  genBtn.textContent = 'AI 生成摘要 & 标签';
});

async function callDeepSeek(title, desc) {
  const prompt = `
【任务1】用一句话（≤30字）总结这段资源：
【任务2】给它打1~3个标签，只能从{学习,娱乐,竞赛,工具}里选。
返回纯 JSON，格式：
{"summary":"...","tags":["..."]}

标题：${title}
简介：${desc}
`;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 本地调试写法，上线请放后端
      Authorization: 'Bearer ' + localStorage.getItem('DS_KEY'),
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 100,
    }),
  });

  if (!response.ok) throw new Error('AI 请求失败 ' + response.status);

  const json = await response.json();
  // 解析返回的 JSON 字符串
  return JSON.parse(json.choices[0].message.content.trim());
}

function rebuildAllcard() {
  allcard.study = document.querySelectorAll('.study .card');
  allcard.entertain = document.querySelectorAll('.entertainment .card');
  allcard.competition = document.querySelectorAll('.competition .card');
}

/*本地存储 key ,这个的确就是照着网上用地，目前还没完全懂*/
const STORAGE_KEY = 'myResourceCards';

/*初始化：刷新时把本地数据读出来并渲染*/
window.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const data = JSON.parse(raw);

  Object.entries(data).forEach(([cate, list]) => {
    const grid = document.querySelector('.' + cate);
    if (!grid) return;
    list.forEach((item) => {
      const card = createCard(
        item.title,
        item.desc,
        item.imgUrl || 'images/placeholder.png' //一开始这里路径写错了，直接写的xx.png导致我的图片刷新后加载不出来
      );
      grid.appendChild(card);
    });
  });
});
/*建卡片*/
function createCard(title, desc, imgSrc) {
  const card = document.createElement('div');
  card.className = 'card new-card';
  card.dataset.desc = desc;
  //一开始这里路径写错了，直接写的xx.png导致我的图片刷新后加载不出来
  card.innerHTML = `
    <img src="${imgSrc}" alt="${title}" onerror="this.src='images/placeholder.png'">
    <p><a href="">${title}</a></p>
  `;
  return card;
}

/*搜索资源部分，用的模板，但是已经看懂了，可以自己写，不过格式也和它差不多*/
/*把所有卡片装进一个容器，方便统一过滤*/
const allcard = {
  study: document.querySelectorAll('.study   .card'),
  entertain: document.querySelectorAll('.entertainment .card'),
  competition: document.querySelectorAll('.competition .card'),
};

const searchinput = document.getElementById('searchinput');

function doSearch() {
  const key = searchinput.value.trim().toLowerCase();
  let hasAny = false;

  Object.values(allcard).forEach((nodeList) => {
    nodeList.forEach((card) => {
      const title = card.querySelector('p').textContent.toLowerCase();
      const desc = (card.dataset.desc || '').toLowerCase();
      const match = title.includes(key) || desc.includes(key);
      card.style.display = match ? '' : 'none';
      if (match) hasAny = true;
    });
  });

  let noResult = document.querySelector('.no-result');
  if (!hasAny && key) {
    if (!noResult) {
      noResult = document.createElement('div');
      noResult.className = 'no-result';
      noResult.textContent = '未找到匹配资源';
      document.querySelector('main').appendChild(noResult);
    }
    noResult.style.display = 'block';
  } else if (noResult) {
    noResult.style.display = 'none';
  }
}

/*实时触发*/
searchinput.addEventListener('input', doSearch);
/*回车触发*/
searchinput.addEventListener('keydown', (e) => e.key === 'Enter' && doSearch());

const openBtn = document.getElementById('openSubmit');
const modal = document.getElementById('submitModal');
const closeBtn = document.getElementById('closeModal');
const form = document.getElementById('submitForm');

/*加入资源部分，有参考，完全理解掌握*/
//这里还是有问题，但是不想改了，问题在于插入的资源没插入资源跳转的链接
openBtn.addEventListener('click', () => (modal.style.display = 'grid'));
closeBtn.addEventListener('click', () => (modal.style.display = 'none'));
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

/* 处理提交 */
form.addEventListener('submit', (e) => {
  /*阻止刷新*/
  e.preventDefault();
  const desc = form.resDesc.value.trim();
  const title = form.resTitle.value.trim();
  const cate = form.resCate.value;
  const imgUrl = form.resImg.value.trim() || 'images/placeholder.png';
  const finalSrc = imgUrl || 'images/placeholder.png';

  /*if填了必填信息*/
  if (!title || !desc) return;

  /* 生成新地卡片 */
  const card = document.createElement('div');
  card.className = 'card new-card';
  card.dataset.desc = desc;
  card.innerHTML = `
    <img src="${finalSrc}" alt="${title}" onerror="this.src='images/placeholder.png'">
  <p><a href="">${title}</a></p>
  `;

  /* 插入对应分区 */
  const targetGrid = document.querySelector('.' + cate);
  if (targetGrid) targetGrid.appendChild(card);
  rebuildAllcard();

  requestAnimationFrame(() => {
    card.classList.add('new-card');
  });

  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (!data[cate]) data[cate] = [];
  data[cate].push({ title, desc, imgUrl });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  form.reset();
  modal.style.display = 'none';

  if (searchinput.value) doSearch();
});

function clearLocal() {
  if (confirm('确认要清除所有提交的资源？')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}
//模块化地原因导致直接写函数再在html调用不被允许，所以主动暴露该函数（查的）
window.clearLocal = clearLocal;

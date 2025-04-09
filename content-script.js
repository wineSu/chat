document.addEventListener('mouseup', function (event) {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText) {
    console.log('Selected text:', selectedText);

    // 发送消息给 background.js
    chrome.runtime.sendMessage({
      message: 'textSelected',
      prompt: '帮我翻译解释这句话-',
      text: selectedText
    });
  }
});

function getTableData() {
  const table = document.body.querySelectorAll('.ant-table-content');
  const target = Array.from(table)[2];
  const rows = target.querySelectorAll('tbody tr'); // 获取所有 tbody 中的 tr 元素
  const data = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.querySelectorAll('td'); // 获取当前行中的所有 td 元素
    const rowData = [];

    for (let j = 0; j < cells.length; j++) {
      const cell = cells[j];
      rowData.push(cell.textContent.trim()); // 获取单元格的文本内容，并去除首尾空格
    }
    data.push(rowData);
  }

  return data; // 返回数据
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getPerfData') {
    // 获取table列表数据
    const dataList = getTableData();
    // 筛选目标数据
    const targetData = [
      '驾车首页',
      '驾车规划结果页-长途&驾车首页进入',
      '驾车规划结果页-短途&驾车首页进入',
      '驾车规划结果页-短途&POI页进入',
      '驾车规划结果页-长途&POI页进入',
      '驾车规划结果页-长途&Scheme冷启进入',
      '驾车规划结果页-短途&Scheme冷启进入',
      '驾车规划结果页-新能源长途&驾车首页进入',
      '驾车导航页-长途&规划结果页进入',
      '驾车导航页-短途&规划结果页进入',
      '驾车导航页-长途&POI页进入',
      '驾车导航页-短途&POI页进入',
      '驾车导航页-新能源长途&规划结果页进入'
    ];

    let res = ``;

    dataList.forEach((item) => {
      if (targetData.includes(item[2])) {
        res += `${item[2]}: ${item[5]}\n`;
      }
    });

    chrome.runtime.sendMessage({
      message: 'textSelected',
      prompt: '帮我格式化这句话，用颜色区分-',
      text: res
    });
  }
});

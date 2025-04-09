import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory
} from '../node_modules/@google/generative-ai/dist/index.mjs';
import { marked } from '../node_modules/marked/lib/marked.esm.js';
import hljs from '../node_modules/highlight.js/lib/index.js';

const apiKey = 'AIzaSyD9QfPH2qN11GJovShApHdQlZAbE__J2Js';

const inputPrompt = document.body.querySelector('#input-prompt');
const buttonPrompt = document.body.querySelector('#button-prompt');
const resultCont = document.body.querySelector('#result_cont');

let userChatList = '你好';
let modelChatList = '你好';

function initModel(generationConfig) {
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE
    }
  ];
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    safetySettings,
    history: [
      {
        role: 'user',
        parts: [{ text: '今天天气怎么样' }]
      },
      {
        role: 'model',
        parts: [{ text: 'Great to meet you. What would you like to know?' }]
      }
    ],
    generationConfig
  });
  return model;
}

function getLastTextArea(name = '.text_response') {
  const elements = document.querySelectorAll(name);
  if (elements.length > 0) {
    const elementsArray = Array.from(elements);
    const lastElement = elementsArray.pop();
    return lastElement;
  } else {
    console.log('没有找到 class 为 myClass 的元素');
  }
}

async function runPrompt(chat, prompt, callback) {
  try {
    const result = await chat.sendMessageStream(prompt);
    const response = await result.stream;
    let text = '';
    for await (const chunk of response) {
      text += chunk.text();
      modelChatList = text;
      callback(text);
    }
  } catch (e) {
    console.log('Prompt failed');
    console.error(e);
    console.log('Prompt:', prompt);
    throw e;
  }
}

inputPrompt.addEventListener('input', () => {
  if (inputPrompt.value.trim()) {
    buttonPrompt.style.setProperty('opacity', '1');
  } else {
    buttonPrompt.style.setProperty('opacity', '0.5');
  }
});

async function enter(searchText) {
  const prompt = searchText || inputPrompt.value.trim();
  if (!prompt) {
    return;
  }

  userChatList = prompt;
  showUserChat(userChatList, prompt);

  inputPrompt.value = '';

  showLoading();

  try {
    const generationConfig = {
      temperature: 0.4
    };
    const model = initModel(generationConfig);
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: userChatList }]
        },
        {
          role: 'model',
          parts: [{ text: modelChatList }]
        }
      ]
    });
    await runPrompt(chat, prompt, (response) => {
      if (response) {
        showResponse(response);
      }
    });
  } catch (e) {
    showError(e);
  }
}

inputPrompt.onkeydown = (event) => {
  if (event.key === 'Enter' && !event.isComposing) {
    // 在这里处理回车事件
    event.preventDefault(); // 阻止默认行为
    enter();
  }
};

buttonPrompt.addEventListener('click', () => {
  enter();
});

function showUserChat(list, prompt) {
  resultCont.insertAdjacentHTML(
    'beforeend',
    `<div class="user_list_item">
      <div class="header">
        <img class="logo" src="../images/u.png" alt="">
      </div>
      <div class="text_response">
        ${prompt}
      </div>
    </div>`
  );
}

function showResponse(response) {
  const ele = getLastTextArea();
  let inner = marked.parse(response);
  ele.innerHTML = inner;
  resultCont.scrollTop = resultCont.scrollHeight;
  ele.scrollTop = ele.scrollHeight;
  hljs.highlightAll();
}

function showLoading() {
  resultCont.insertAdjacentHTML(
    'beforeend',
    `<div class="model_list_item">
      <div class="header">
        <img class="logo" src="../images/logo.png" alt="">
      </div>
      <div class="text_response">
        <span class="blink">...</span>
      </div>
    </div>`
  );
}

function showError(error) {
  const ele = getLastTextArea();
  ele.innerHTML = error;
}

chrome.storage.session.onChanged.addListener(({selectedText, prompt}) => {
  if (selectedText?.newValue || prompt.newValue) {
    // 大模型搜索
    enter(`${prompt.newValue}${selectedText.newValue}`);
  }
});


const perfBtn = document.body.querySelector('.perf');

perfBtn.addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    tabs[0].id && chrome.tabs.sendMessage(tabs[0].id, {action: "getPerfData"});
  });
});

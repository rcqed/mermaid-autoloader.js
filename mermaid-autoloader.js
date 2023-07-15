// http://127.0.0.1/456/index.html?path=./123.md
var mermaidDiv;
var isDragging = false;
var offset = { x: 0, y: 0 };

function loadFile() {
    mermaidDiv = document.querySelector('.mermaid');
    mermaidDiv.addEventListener('mousedown', startDragging);
    mermaidDiv.addEventListener('mousemove', handleDragging);
    mermaidDiv.addEventListener('mouseup', stopDragging);
    mermaidDiv.addEventListener('mouseleave', stopDragging);
    mermaidDiv.addEventListener('contextmenu', function (event) {
        event.preventDefault(); // 阻止右键菜单弹出
    });

    // 添加事件监听器，以便在窗口大小变化时重新调整图表位置和大小
    window.addEventListener('resize', adjustMermaid);

    // 添加事件监听器，以便响应鼠标滚轮事件
    mermaidDiv.addEventListener('wheel', handleWheel);

    // 获取URL中的参数
    const urlParams = new URLSearchParams(window.location.search);
    const filePath = urlParams.get('path'); // 从?path=./123.txt参数中获取文件路径

    if (filePath) {
        // 发起HTTP请求获取文件内容
        fetch(filePath)
            .then(response => response.text())
            .then(content => {
                // 省略"```mermaid"和"```"内容
                content = content.replace(/```mermaid/g, '').replace(/```/g, '');
                mermaidDiv.textContent = content; // 将文件内容放入<div class="mermaid">元素中

                // 动态创建并加载mermaid.js脚本
                const mermaidScript = document.createElement('script');
                mermaidScript.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.2.4/dist/mermaid.min.js';
                mermaidScript.onload = function () {
                    // 初始化图表
                    mermaid.init(undefined, mermaidDiv);
                    // 调整图表位置和大小
                    adjustMermaid();
                };
                document.head.appendChild(mermaidScript);
            })
            .catch(error => {
                console.error('Failed to fetch file:', error);
            });
    }
}

function startDragging(event) {
    isDragging = true;
    offset.x = event.clientX - mermaidDiv.offsetLeft;
    offset.y = event.clientY - mermaidDiv.offsetTop;
}

function handleDragging(event) {
    if (!isDragging) {
        return;
    }

    var x = event.clientX - offset.x;
    var y = event.clientY - offset.y;
    mermaidDiv.style.left = x + 'px';
    mermaidDiv.style.top = y + 'px';
}

function stopDragging() {
    isDragging = false;
}

function adjustMermaid() {
    var container = mermaidDiv.parentElement;
    var containerWidth = container.offsetWidth;
    var containerHeight = container.offsetHeight;
    var mermaidWidth = mermaidDiv.offsetWidth;
    var mermaidHeight = mermaidDiv.offsetHeight;
    var scaleX = containerWidth / mermaidWidth;
    var scaleY = containerHeight / mermaidHeight;
    var scale = Math.min(scaleX, scaleY);

    // 设置图表的缩放和位移样式
    mermaidDiv.style.transform = 'scale(' + scale + ') translate(-50%, -50%)';
    mermaidDiv.style.transformOrigin = 'top left';
}

function handleWheel(event) {
    event.preventDefault(); // 阻止默认的滚轮行为

    var delta = -Math.sign(event.deltaY);
    var scaleIncrement = 0.5; // 调整缩放的增量值，可以增大或减小
    var currentScale = getCurrentScale();
    var newScale = currentScale + delta * scaleIncrement;

    if (newScale < 0.1) {
        newScale = 0.1;
    }

    setScale(newScale);
}

function getCurrentScale() {
    var transform = window.getComputedStyle(mermaidDiv).getPropertyValue('transform');
    var matrix = transform.match(/^matrix\((.+)\)$/);

    if (matrix) {
        var values = matrix[1].split(',');
        return parseFloat(values[0]);
    }

    return 1;
}

function setScale(scale) {
    mermaidDiv.style.transform = 'scale(' + scale + ') translate(-50%, -50%)';
}

window.onload = loadFile; // 在整个页面加载完成后调用loadFile()函数

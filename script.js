document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('whiteboard');
    const ctx = canvas.getContext('2d');
    const tools = {
        pencil: document.getElementById('pencil'),
        line: document.getElementById('line'),
        rectangle: document.getElementById('rectangle'),
        circle: document.getElementById('circle'),
        triangle: document.getElementById('triangle'),
        eraser: document.getElementById('eraser'),
        clear: document.getElementById('clear'),
        save: document.getElementById('save'),
        load: document.getElementById('load')
    };
    const colorPicker = document.getElementById('colorPicker');
    console.log(colorPicker);
    const brushSize = document.getElementById('brushSize');
    console.log(brushSize);
    const fillShape = document.getElementById('fillShape');

   
    let isDrawing = false;
    let currentTool = 'pencil';
    let X, Y;
    let snapshot;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 60;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize.value;
    ctx.strokeStyle = colorPicker.value;

    function takeSnapshot() {
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    function restoreSnapshot() {
        ctx.putImageData(snapshot, 0, 0);
    }

    function startDrawing(e) {
        isDrawing = true;
        [X, Y] = [e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop];
        ctx.beginPath();
        ctx.moveTo(X, Y);
        takeSnapshot();
    }

    function draw(e) {
        if (isDrawing==false) return;
        
        const x = e.clientX - canvas.offsetLeft;
        const y = e.clientY - canvas.offsetTop;

        switch(currentTool) {
            case 'pencil':
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
            case 'eraser':
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
            default:
                restoreSnapshot();
                drawShape(x, y);
                break;
        }
    }

    function drawShape(x, y) {
        ctx.beginPath();
        
        switch(currentTool) {
            case 'line':
                ctx.moveTo(X, Y);
                ctx.lineTo(x, y);
                break;
            case 'rectangle':
                const width = x - X;
                const height = y - Y;
                if (fillShape.checked) {
                    ctx.fillRect(X, Y, width, height);
                }
                ctx.strokeRect(X, Y, width, height);
                break;
            case 'circle':
                const radius = Math.sqrt(Math.pow(x - X, 2) + Math.pow(y - Y, 2));
                ctx.arc(X, Y, radius, 0, 2 * Math.PI);
                break;
            case 'triangle':
                ctx.moveTo(X, Y);
                ctx.lineTo(x, y);
                ctx.lineTo(X - (x - X), y);
                ctx.closePath();
                break;
        }

        if (fillShape.checked && currentTool !== 'line') {
            ctx.fill();
        }
        ctx.stroke();
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function handleToolClick(toolName) {
        Object.values(tools).forEach(tool => tool.classList.remove('active'));
        tools[toolName].classList.add('active');
        
        currentTool = toolName;
        
        switch(toolName) {
            case 'pencil':
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = colorPicker.value;
                break;
            case 'eraser':
                ctx.globalCompositeOperation = 'destination-out';
                break;
            case 'clear':
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                break;
            case 'save':
                const link = document.createElement('a');
                link.download = 'whiteboard.png';
                link.href = canvas.toDataURL();
                link.click();
                break;
            case 'load':
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.src = event.target.result;
                        img.onload = () => {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(img, 0, 0);
                        };
                    };
                    reader.readAsDataURL(file);
                };
                input.click();
                break;
            default:
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = colorPicker.value;
                break;
        }
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchend', (e) => {
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    });

    Object.keys(tools).forEach(tool => {
        tools[tool].addEventListener('click', () => handleToolClick(tool));
    });

    colorPicker.addEventListener('change', (e) => {
        ctx.strokeStyle = e.target.value;
        ctx.fillStyle = e.target.value;
    });

    brushSize.addEventListener('change', (e) => {
        ctx.lineWidth = e.target.value;
    });
}); 
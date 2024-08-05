document.getElementById('image').addEventListener('change', function(event) {
    const imageInput = event.target.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(imageInput);
    img.onload = function() {
        // 画像を縮小して新しいキャンバスに描画
        const maxWidth = 800;
        const scaleFactor = img.width > maxWidth ? maxWidth / img.width : 1;
        const newWidth = img.width * scaleFactor;
        const newHeight = img.height * scaleFactor;

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // 縮小された画像を表示するためにDataURLを取得
        const resizedImageURL = canvas.toDataURL();
        const resizedImage = document.getElementById('uploaded-image');
        resizedImage.src = resizedImageURL;

        // 選択ボックスを表示
        const selectionBox = document.getElementById('selection-box');
        selectionBox.style.width = '400px';
        selectionBox.style.height = '157px';
        selectionBox.style.top = '50px';
        selectionBox.style.left = '50px';
        selectionBox.style.display = 'block';

        // 選択ボックスのイベントリスナーを設定
        let isDragging = false;
        let isResizing = false;
        let startX, startY, startWidth, startHeight, handle;

        selectionBox.addEventListener('mousedown', function(event) {
            if (event.target.classList.contains('resize-handle')) {
                isResizing = true;
                handle = event.target.classList[1];
                startX = event.clientX;
                startY = event.clientY;
                startWidth = parseInt(selectionBox.style.width);
                startHeight = parseInt(selectionBox.style.height);
            } else {
                isDragging = true;
                startX = event.clientX - parseInt(selectionBox.style.left);
                startY = event.clientY - parseInt(selectionBox.style.top);
            }
        });

        document.addEventListener('mousemove', function(event) {
            if (isDragging) {
                selectionBox.style.left = `${event.clientX - startX}px`;
                selectionBox.style.top = `${event.clientY - startY}px`;
            } else if (isResizing) {
                const dx = event.clientX - startX;
                const dy = event.clientY - startY;
                if (handle === 'top-left') {
                    selectionBox.style.width = `${startWidth - dx}px`;
                    selectionBox.style.height = `${startHeight - dy}px`;
                    selectionBox.style.left = `${parseInt(selectionBox.style.left) + dx}px`;
                    selectionBox.style.top = `${parseInt(selectionBox.style.top) + dy}px`;
                } else if (handle === 'top-right') {
                    selectionBox.style.width = `${startWidth + dx}px`;
                    selectionBox.style.height = `${startHeight - dy}px`;
                    selectionBox.style.top = `${parseInt(selectionBox.style.top) + dy}px`;
                } else if (handle === 'bottom-left') {
                    selectionBox.style.width = `${startWidth - dx}px`;
                    selectionBox.style.height = `${startHeight + dy}px`;
                    selectionBox.style.left = `${parseInt(selectionBox.style.left) + dx}px`;
                } else if (handle === 'bottom-right') {
                    selectionBox.style.width = `${startWidth + dx}px`;
                    selectionBox.style.height = `${startHeight + dy}px`;
                }
            }
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
            isResizing = false;
        });

        // フォームが送信されたときに選択された部分をキャンバスに描画
        document.getElementById('news-form').addEventListener('submit', function(event) {
            event.preventDefault();
            
            const title = document.getElementById('title').value;
            const content = document.getElementById('content').value;
            const comment = document.getElementById('comment').value;
            const outputCanvas = document.getElementById('news-canvas');
            const outputCtx = outputCanvas.getContext('2d');
            const background = new Image();
            
            background.onload = function() {
                outputCanvas.width = background.width;
                outputCanvas.height = background.height;
                
                outputCtx.drawImage(background, 0, 0);
                
                // 縮小された画像の選択部分をキャンバスに描画
                const sx = parseInt(selectionBox.style.left);
                const sy = parseInt(selectionBox.style.top);
                const sWidth = parseInt(selectionBox.style.width);
                const sHeight = parseInt(selectionBox.style.height);
                
                outputCtx.drawImage(resizedImage, sx, sy, sWidth, sHeight, 50, 81, 400, 157);
                
                // タイトルの中央揃え
                outputCtx.fillStyle = "black";
                outputCtx.font = "bold 20px 'GenShinGothic'";
                const titleWidth = outputCtx.measureText(title).width;
                const titleX = (outputCanvas.width - titleWidth) / 2;
                outputCtx.fillText(title, titleX, 270);
                
                // ニュース内容の中央揃え
                outputCtx.font = "13px 'GenShinGothic'";
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    const lineWidth = outputCtx.measureText(line).width;
                    const lineX = (outputCanvas.width - lineWidth) / 2;
                    outputCtx.fillText(line, lineX, outputCanvas.height - 240 + (index * 24));
                });

                // コメントの描画（縁取り）
                outputCtx.font = "italic 15px 'GenShinGothic'";
                const commentLines = comment.split('\n');
                commentLines.forEach((line, index) => {
                    const lineWidth = outputCtx.measureText(line).width;
                    const lineX = (outputCanvas.width - lineWidth) / 2;
                    // 黒い縁取り
                    outputCtx.lineWidth = 4;
                    outputCtx.strokeStyle = 'black';
                    outputCtx.strokeText(line, lineX, outputCanvas.height - 35 + (index * 20));
                    // 白いテキスト
                    outputCtx.fillStyle = 'white';
                    outputCtx.fillText(line, lineX, outputCanvas.height - 35 + (index * 20)); // Y座標を調整
                });
            };
            background.src = 'ダウンロード (2).png';
        });
    };
});

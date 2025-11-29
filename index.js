(function() {
    'use strict';

    console.log('[可拖动开场白] 插件已加载');

    // 使用 ID 跟踪拖拽元素，避免引用问题
    let draggingId = null;
    let orderChanged = false;

    function setupDraggable() {
        const popup = document.querySelector('.popup');
        if (!popup) return;

        const container = popup.querySelector('.alternate_greetings_list');
        if (!container) return;

        if (container.dataset.draggableSetup === 'done') return;

        const items = container.querySelectorAll('.alternate_greeting');
        if (items.length === 0) return;

        // 给每个项目添加唯一ID，用于跟踪
        items.forEach((item, index) => {
            item.setAttribute('data-greeting-id', 'greeting-' + index);
        });

        container.dataset.draggableSetup = 'done';
        console.log('[可拖动开场白] ✓ 找到', items.length, '个开场白');

        setupOKButtonInterceptor(popup, container);

        // 防止容器被拖动
        container.setAttribute('draggable', 'false');
        
        // 为每个开场白添加拖拽事件
        items.forEach((item) => {
            // 使用HTML5属性显式启用拖拽
            item.setAttribute('draggable', 'true');
            item.style.cursor = 'move';
            
            // 拖拽开始
            item.ondragstart = function(e) {
                draggingId = this.getAttribute('data-greeting-id');
                this.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
                console.log('[可拖动开场白] 开始拖拽', draggingId);
            };
            
            // 拖拽结束
            item.ondragend = function(e) {
                this.style.opacity = '1';
                console.log('[可拖动开场白] 结束拖拽', draggingId);
                
                // 清理所有边框
                items.forEach(g => {
                    g.style.borderTop = '';
                    g.style.borderBottom = '';
                });
                
                if (draggingId) {
                    orderChanged = true;
                    draggingId = null;
                    updateNumbers(container);
                }
            };
            
            // 拖拽移动中
            item.ondragover = function(e) {
                e.preventDefault();
                
                // 找到当前被拖拽的元素
                const dragItem = document.querySelector(`[data-greeting-id="${draggingId}"]`);
                
                // 如果找不到被拖拽元素，或者是自身，直接返回
                if (!dragItem || this === dragItem) return;

                // 清除其他项的边框
                items.forEach(g => {
                    if (g !== this) {
                        g.style.borderTop = '';
                        g.style.borderBottom = '';
                    }
                });
                
                const rect = this.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                
                // 根据鼠标位置决定插入位置
                try {
                    if (e.clientY < midpoint) {
                        this.style.borderTop = '3px solid #0078d7';
                        this.style.borderBottom = '';
                        
                        if (this.previousElementSibling !== dragItem) {
                            container.insertBefore(dragItem, this);
                        }
                    } else {
                        this.style.borderBottom = '3px solid #0078d7';
                        this.style.borderTop = '';
                        
                        if (this.nextElementSibling !== dragItem) {
                            // 确保 nextSibling 存在
                            if (this.nextElementSibling) {
                                container.insertBefore(dragItem, this.nextElementSibling);
                            } else {
                                // 如果是最后一个元素，直接附加到末尾
                                container.appendChild(dragItem);
                            }
                        }
                    }
                } catch (err) {
                    console.error('[可拖动开场白] 拖拽错误:', err);
                }
            };
            
            // 允许放置
            item.ondragenter = function(e) {
                e.preventDefault();
            };
            
            // 放置完成
            item.ondrop = function(e) {
                e.preventDefault();
            };
        });

        console.log('[可拖动开场白] ✅ 拖拽已启用');
    }

    function setupOKButtonInterceptor(popup, container) {
        const okButton = popup.querySelector('.popup-button-ok');
        if (!okButton || okButton.dataset.intercepted === 'true') return;

        okButton.dataset.intercepted = 'true';

        okButton.addEventListener('click', function(e) {
            if (orderChanged) {
                console.log('[可拖动场白] 点击OK，保存新顺序');
                saveNewOrder(container);
                orderChanged = false;
            }
        }, true);
    }

    function updateNumbers(container) {
        const items = container.querySelectorAll('.alternate_greeting');
        items.forEach((item, index) => {
            const numberSpan = item.querySelector('.greeting_index');
            if (numberSpan) {
                numberSpan.textContent = index + 1;
            }
        });
    }

    function saveNewOrder(container) {
        try {
            const items = container.querySelectorAll('.alternate_greeting');
            const newGreetings = [];
            
            items.forEach((item) => {
                const textarea = item.querySelector('textarea');
                if (textarea && textarea.value.trim()) {
                    newGreetings.push(textarea.value);
                }
            });

            const context = SillyTavern.getContext();
            const charId = context.characterId;
            
            context.characters[charId].data.alternate_greetings = newGreetings;
            
            console.log('[可拖动开场白] 💾 已保存', newGreetings.length, '个开场白');
            
        } catch (error) {
            console.error('[可拖动开场白] 保存失败:', error);
        }
    }

    const observer = new MutationObserver(function() {
        setTimeout(setupDraggable, 100);
    });

    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
    
    setInterval(setupDraggable, 2000);

    console.log('[可拖动开场白] ✓ 插件初始化完成');
})();


(function() {
    'use strict';

    console.log('[可拖动开场白] 插件已加载');

    let dragging = null;
    let orderChanged = false;

    function setupDraggable() {
        const popup = document.querySelector('.popup');
        if (!popup) return;

        const container = popup.querySelector('.alternate_greetings_list');
        if (!container) return;

        if (container.dataset.draggableSetup === 'done') return;

        const items = container.querySelectorAll('.alternate_greeting');
        if (items.length === 0) return;

        container.dataset.draggableSetup = 'done';
        console.log('[可拖动开场白] ✓ 找到', items.length, '个开场白');

        setupOKButtonInterceptor(popup, container);

        container.removeAttribute('draggable');
        container.draggable = false;

        items.forEach((item) => {
            item.draggable = true;
            item.style.cursor = 'move';
            item.style.transition = 'all 0.2s';

            item.ondragstart = function(e) {
                dragging = this;
                this.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
            };

            item.ondragend = function(e) {
                this.style.opacity = '1';
                this.style.borderTop = '';
                this.style.borderBottom = '';
                
                items.forEach(g => {
                    g.style.borderTop = '';
                    g.style.borderBottom = '';
                });
                
                orderChanged = true;
                updateNumbers(container);
            };

            item.ondragover = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (this === dragging) return;

                items.forEach(g => {
                    if (g !== this) {
                        g.style.borderTop = '';
                        g.style.borderBottom = '';
                    }
                });

                const rect = this.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;

                if (e.clientY < midpoint) {
                    this.style.borderTop = '3px solid #0078d7';
                    this.style.borderBottom = '';
                    container.insertBefore(dragging, this);
                } else {
                    this.style.borderBottom = '3px solid #0078d7';
                    this.style.borderTop = '';
                    container.insertBefore(dragging, this.nextSibling);
                }
            };

            item.ondragenter = function(e) {
                e.preventDefault();
            };

            item.ondrop = function(e) {
                e.preventDefault();
                e.stopPropagation();
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

    const observer = new MutationObserver(setupDraggable);
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(setupDraggable, 2000);

    console.log('[可拖动开场白] ✓ 插件初始化完成');
})();

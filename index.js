(function() {
    'use strict';

    const MODULE_NAME = 'draggable-greetings';
    
    // 初始化插件
    function init() {
        console.log('可拖动开场白插件已加载');
        
        // 监听角色加载事件
        eventSource.on('characterLoaded', enableDraggable);
        
        // 如果已有角色，立即启用
        if (this_chid !== undefined) {
            enableDraggable();
        }
    }

    // 启用拖拽功能
    function enableDraggable() {
        setTimeout(() => {
            const container = document.querySelector('#character_popup .alternate_greetings_list, #mes_example_dialog .alternate_greetings_list');
            
            if (!container) {
                console.log('未找到开场白容器');
                return;
            }

            // 移除旧的事件监听器
            container.querySelectorAll('.alternate_greeting').forEach(item => {
                item.draggable = true;
            });

            let draggedElement = null;

            container.addEventListener('dragstart', function(e) {
                if (e.target.classList.contains('alternate_greeting')) {
                    draggedElement = e.target;
                    e.target.style.opacity = '0.5';
                }
            });

            container.addEventListener('dragend', function(e) {
                if (e.target.classList.contains('alternate_greeting')) {
                    e.target.style.opacity = '';
                }
            });

            container.addEventListener('dragover', function(e) {
                e.preventDefault();
                const afterElement = getDragAfterElement(container, e.clientY);
                if (afterElement == null) {
                    container.appendChild(draggedElement);
                } else {
                    container.insertBefore(draggedElement, afterElement);
                }
            });

            container.addEventListener('drop', function(e) {
                e.preventDefault();
                saveNewOrder();
            });

            console.log('开场白拖拽功能已启用');
        }, 500);
    }

    // 获取拖拽后的位置
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.alternate_greeting:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // 保存新的顺序
    function saveNewOrder() {
        const container = document.querySelector('#character_popup .alternate_greetings_list, #mes_example_dialog .alternate_greetings_list');
        const items = container.querySelectorAll('.alternate_greeting');
        
        const newOrder = [];
        items.forEach((item, index) => {
            const textarea = item.querySelector('textarea');
            if (textarea) {
                newOrder.push(textarea.value);
            }
        });

        // 更新角色数据
        if (characters[this_chid]) {
            characters[this_chid].data.alternate_greetings = newOrder;
            console.log('开场白顺序已更新');
            
            // 触发保存
            saveCharacterDebounced();
        }
    }

    // 注册插件
    jQuery(async () => {
        init();
    });
})();

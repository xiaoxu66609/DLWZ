        // 初始化 Lucide 图标
        lucide.createIcons();

        // ═══════════════════════════════════════════════════════════════
        //  萌新维护指南：新闻与图片数据配置区
        //  你只需要改下面的数组，完全不用碰 HTML 标签！
        // ═══════════════════════════════════════════════════════════════

        // 【通知公告】格式：
        // { month: '06', day: '01', tag: 'NEW', title: '标题', desc: '摘要' }
        // 不需要标签时，去掉 tag 字段即可
        const noticeData = [
            // 示例（有 NEW 标签）：
            // { month: '06', day: '01', tag: 'NEW', title: '关于2026年暑假放假安排的通知', desc: '根据市教育局统一部署，结合我校实际情况，现将2026年暑假放假安排通知如下...' },
            // 示例（无标签）：
            // { month: '05', day: '28', title: '2026级高一新生报到须知', desc: '欢迎加入大连五中大家庭，请各位新生按照以下要求准时报到...' },
        ];

        // 【校园新闻】格式：
        // { type: 'featured', date: '2026-05-20', tag: '校园活动', image: '图片地址', title: '标题', desc: '摘要' }
        // { type: 'normal',  date: '2026-05-15', image: '图片地址', title: '标题' }
        const newsData = [
            // 示例（带大图）：
            // { type: 'featured', date: '2026-05-20', tag: '校园活动', image: 'https://images.unsplash.com/photo-xxx?w=800&q=80', title: '我校举办第十八届校园科技文化节', desc: '本届科技文化节以"创新引领未来"为主题...' },
            // 示例（普通列表）：
            // { type: 'normal', date: '2026-05-15', image: 'https://images.unsplash.com/photo-xxx?w=400&q=80', title: '高三年级举行成人礼暨高考誓师大会' },
        ];

        // 【校园风光图片】格式：
        // { src: '图片地址', caption: '图片说明' }
        // 想加图就复制一行，想删图就删掉一行
        const campusImages = [
            { src: '', caption: '现代化教学楼' },
            { src: '', caption: '综合实验楼' },
            { src: '', caption: '400米标准操场' },
            { src: '', caption: '图书馆（81000册藏书）' },
            { src: '', caption: '智慧课堂' },
            { src: '', caption: '体育活动' },
            { src: '', caption: '社团活动（20个社团）' },
            { src: '', caption: '艺术教室' },
        ];
        // ═══════════════════════════════════════════════════════════════
        //  数据配置区结束 —— 下面不用改
        // ═══════════════════════════════════════════════════════════════

        // 渲染通知公告
        function renderNotices() {
            const container = document.getElementById('notice-list');
            if (!container || !noticeData.length) return;
            container.innerHTML = noticeData.map(item => `
                <div class="group flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <div class="flex-shrink-0 w-14 h-14 ${item.tag ? 'bg-school-red' : 'bg-school-dark'} text-white rounded-lg flex flex-col items-center justify-center">
                        <span class="text-xs font-bold">${item.month}月</span>
                        <span class="text-lg font-bold leading-none">${item.day}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            ${item.tag ? `<span class="px-2 py-0.5 bg-school-red text-white text-[10px] rounded">${item.tag}</span>` : ''}
                            <h4 class="font-bold text-slate-800 text-sm truncate group-hover:text-school-dark transition-colors">${item.title}</h4>
                        </div>
                        <p class="text-xs text-slate-500 line-clamp-2">${item.desc}</p>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        }

        // 渲染校园新闻
        function renderNews() {
            const container = document.getElementById('news-list');
            if (!container || !newsData.length) return;
            container.innerHTML = newsData.map(item => {
                if (item.type === 'featured') {
                    const imgHtml = item.image 
                        ? `<img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">`
                        : `<div class="img-placeholder w-full h-full">[请替换]<br>${item.title}</div>`;
                    return `
                        <a href="#" class="group block rounded-2xl overflow-hidden border border-slate-100 hover:border-school-dark/20 transition-all card-hover" title="即将上线">
                            <div class="relative h-48 overflow-hidden">
                                ${imgHtml}
                                <div class="absolute top-4 left-4 px-3 py-1 bg-school-dark text-white text-xs rounded-full">${item.tag}</div>
                            </div>
                            <div class="p-5">
                                <div class="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                    <i data-lucide="calendar" class="w-3 h-3"></i>
                                    ${item.date}
                                </div>
                                <h4 class="font-bold text-slate-900 mb-2 group-hover:text-school-dark transition-colors">${item.title}</h4>
                                <p class="text-sm text-slate-600 line-clamp-2">${item.desc}</p>
                            </div>
                        </a>
                    `;
                } else {
                    const imgHtml = item.image
                        ? `<img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">`
                        : `<div class="img-placeholder w-full h-full text-xs">[请替换]</div>`;
                    return `
                        <a href="#" class="group flex gap-4 items-start" title="即将上线">
                            <div class="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                ${imgHtml}
                            </div>
                            <div>
                                <div class="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                    <i data-lucide="calendar" class="w-3 h-3"></i>
                                    ${item.date}
                                </div>
                                <h4 class="font-bold text-slate-800 text-sm group-hover:text-school-dark transition-colors line-clamp-2">${item.title}</h4>
                            </div>
                        </a>
                    `;
                }
            }).join('');
            lucide.createIcons();
        }

        // 渲染校园风光
        // 渲染校园风光
function renderCampus() {
    const container = document.getElementById('campus-grid');
    if (!container) return;
    
    // ─── 直接在这里硬编码补全你所有的 10 张照片 ───
    const myPhotos = [
        { src: './images/新教学楼外景.jpg', caption: '新教学楼外景' },
        { src: './images/新教学楼内景.jpg', caption: '新教学楼内景' },
        { src: './images/鸟瞰全景.jpg', caption: '校园鸟瞰全景' },
        { src: './images/教室照片.jpg', caption: '和雅多功能教室' },
        { src: './images/校园活动.JPG', caption: '阳光大课间' },
        { src: './images/毕业典礼.jpg', caption: '桃李芬芳毕业季' },
        { src: './images/新楼正门内景.jpg', caption: '新楼正门内景' },
        { src: './images/宣传海报.jpg', caption: '校园宣传海报' },
        { src: './images/体育馆报告厅外景.jpg', caption: '体育馆报告厅外景' },
        { src: './images/足球文化.jpg', caption: '特色足球文化' }
    ];

    container.innerHTML = myPhotos.map((img, index) => {
        return `<div class="group relative rounded-2xl overflow-hidden h-48 md:h-64 cursor-pointer animate-fade-up" style="transition-delay: ${(index % 4) * 50}ms" onclick="openLightbox(${index})">
            <img src="${img.src}" alt="${img.caption}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p class="text-white font-bold text-sm">${img.caption}</p>
            </div>
        </div>`;
    }).join('');
}
        // 页面加载后执行渲染
        renderNotices();
        renderNews();
        renderCampus();

        // 加载动画
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.getElementById('loader').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('loader').style.display = 'none';
                }, 500);
            }, 1000);
        });

        // 初始化 Swiper
        const heroSwiper = new Swiper('.hero-swiper', {
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            }
        });

        // 滚动动画
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // 数字计数动画
                    if (entry.target.querySelector('.count-up')) {
                        entry.target.querySelectorAll('.count-up').forEach(el => {
                            const target = parseInt(el.getAttribute('data-target'));
                            animateCount(el, target);
                        });
                    }
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-fade-up').forEach(el => {
            observer.observe(el);
        });

        function animateCount(el, target) {
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target;
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(current);
                }
            }, 30);
        }

        // 导航栏滚动效果
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            const backToTop = document.getElementById('back-to-top');
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                header.classList.add('shadow-md');
                backToTop.classList.remove('opacity-0', 'invisible');
                backToTop.classList.add('opacity-100', 'visible');
            } else {
                header.classList.remove('shadow-md');
                backToTop.classList.add('opacity-0', 'invisible');
                backToTop.classList.remove('opacity-100', 'visible');
            }

            lastScroll = currentScroll;
        });

        // 返回顶部
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // 搜索切换
        function toggleSearch() {
            const searchBar = document.getElementById('search-bar');
            searchBar.classList.toggle('hidden');
            if (!searchBar.classList.contains('hidden')) {
                searchBar.querySelector('input').focus();
            }
        }

        // 移动端菜单
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        }

        // 主题切换（简单模拟）
        function toggleTheme() {
            const icon = document.getElementById('theme-icon');
            if (icon.getAttribute('data-lucide') === 'sun') {
                icon.setAttribute('data-lucide', 'moon');
                document.body.classList.add('dark');
            } else {
                icon.setAttribute('data-lucide', 'sun');
                document.body.classList.remove('dark');
            }
            lucide.createIcons();
        }

        // 标签切换
        function switchTab(tabName) {
            // 隐藏所有内容
            document.querySelectorAll('.tab-content').forEach(el => {
                el.classList.add('hidden');
            });

            // 显示选中内容
            document.getElementById('content-' + tabName).classList.remove('hidden');

            // 更新按钮样式
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('bg-school-dark', 'text-white');
                btn.classList.add('bg-white', 'text-slate-600', 'hover:bg-slate-100', 'border', 'border-slate-200');
            });

            const activeBtn = document.getElementById('tab-' + tabName);
            activeBtn.classList.remove('bg-white', 'text-slate-600', 'hover:bg-slate-100', 'border', 'border-slate-200');
            activeBtn.classList.add('bg-school-dark', 'text-white');
        }

        // Lightbox（数据来自上方 campusImages 数组）
        let currentImage = 0;

        function openLightbox(index) {
            currentImage = index;
            updateLightbox();
            document.getElementById('lightbox').classList.remove('hidden');
            document.getElementById('lightbox').classList.add('flex');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            document.getElementById('lightbox').classList.add('hidden');
            document.getElementById('lightbox').classList.remove('flex');
            document.body.style.overflow = '';
        }

        function updateLightbox() {
            const img = campusImages[currentImage];
            // 自动将缩略图尺寸替换为大图尺寸
            const largeSrc = img.src.replace('w=600', 'w=1200');
            document.getElementById('lightbox-img').src = largeSrc;
            document.getElementById('lightbox-caption').textContent = img.caption;
        }

        function nextImage() {
            currentImage = (currentImage + 1) % images.length;
            updateLightbox();
        }

        function prevImage() {
            currentImage = (currentImage - 1 + images.length) % images.length;
            updateLightbox();
        }

        // 键盘支持
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('lightbox').classList.contains('hidden')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        });

        // 点击背景关闭
        document.getElementById('lightbox').addEventListener('click', (e) => {
            if (e.target === document.getElementById('lightbox')) {
                closeLightbox();
            }
        });

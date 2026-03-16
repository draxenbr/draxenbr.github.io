// CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBZ_3iMIlOA09AptniHlZCwWKBu6Ci_rO8",
    authDomain: "draxenbr-2d193.firebaseapp.com",
    databaseURL: "https://draxenbr-2d193-default-rtdb.firebaseio.com",
    projectId: "draxenbr-2d193",
    storageBucket: "draxenbr-2d193.firebasestorage.app",
    messagingSenderId: "507499041074",
    appId: "1:507499041074:web:d70105f19c562d052d072b"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let isAdminMode = false;

// Auth
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
auth.onAuthStateChanged((user) => {
    if (user) {
        isAdminMode = true;
        document.body.classList.add('admin-mode');
        document.getElementById('adminPanel').classList.add('active');
        document.getElementById('overlay').classList.remove('active');
        loadData();
    } else {
        isAdminMode = false;
        document.body.classList.remove('admin-mode');
        document.getElementById('adminPanel').classList.remove('active');
    }
});

// Login
function showLoginModal() {
    document.getElementById('overlay').classList.add('active');
    document.getElementById('loginModal').style.display = 'block';
}

function hideLoginModal() {
    document.getElementById('overlay').classList.remove('active');
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginError').style.display = 'none';
}

function hideAllModals() {
    hideLoginModal();
    if (isAdminMode) {
        document.getElementById('adminPanel').classList.remove('active');
        document.body.classList.remove('admin-mode');
    }
}

async function loginWithEmail() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        hideLoginModal();
    } catch (error) {
        document.getElementById('loginError').style.display = 'block';
    }
}

function logout() {
    auth.signOut().then(() => {
        isAdminMode = false;
        document.body.classList.remove('admin-mode');
        document.getElementById('adminPanel').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
        loadData();
    });
}

// YouTube ID
function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// ===== FUNÇÕES DA GALERIA =====
async function addImage() {
    const url = document.getElementById('newImageUrl').value;
    if (!url) {
        alert('Digite uma URL válida!');
        return;
    }
    
    try {
        const snapshot = await db.collection('images').get();
        const ordem = snapshot.size;
        
        await db.collection('images').add({
            url: url,
            ordem: ordem
        });
        
        document.getElementById('newImageUrl').value = '';
        loadData();
        alert('✅ Imagem adicionada!');
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

async function deleteImage(id) {
    if (confirm('Remover esta imagem?')) {
        await db.collection('images').doc(id).delete();
        loadData();
    }
}

// ===== FUNÇÕES DA WIKI =====
async function addWikiArticle() {
    const title = document.getElementById('newWikiTitle').value;
    const desc = document.getElementById('newWikiDesc').value;
    const link = document.getElementById('newWikiLink').value;
    const imageUrl = document.getElementById('newWikiImageUrl').value;
    
    if (!title || !desc) {
        alert('Preencha título e descrição!');
        return;
    }
    
    try {
        const snapshot = await db.collection('wiki').get();
        const ordem = snapshot.size;
        
        await db.collection('wiki').add({
            titulo: title,
            descricao: desc,
            link: link || '',
            imagem: imageUrl || '',
            ordem: ordem
        });
        
        document.getElementById('newWikiTitle').value = '';
        document.getElementById('newWikiDesc').value = '';
        document.getElementById('newWikiLink').value = '';
        document.getElementById('newWikiImageUrl').value = '';
        
        loadData();
        alert('✅ Artigo adicionado!');
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

async function deleteWikiArticle(id) {
    if (confirm('Remover este artigo?')) {
        await db.collection('wiki').doc(id).delete();
        loadData();
    }
}

// ===== FUNÇÕES DAS FEATURES =====
async function addFeature() {
    const title = document.getElementById('newFeatureTitle').value;
    const desc = document.getElementById('newFeatureDesc').value;
    
    if (!title || !desc) {
        alert('Preencha título e descrição!');
        return;
    }
    
    try {
        const snapshot = await db.collection('features').get();
        const ordem = snapshot.size;
        
        await db.collection('features').add({
            title: title,
            desc: desc,
            ordem: ordem
        });
        
        document.getElementById('newFeatureTitle').value = '';
        document.getElementById('newFeatureDesc').value = '';
        loadData();
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

async function deleteFeature(id) {
    if (confirm('Remover esta feature?')) {
        await db.collection('features').doc(id).delete();
        loadData();
    }
}

// ===== FUNÇÕES DAS REGRAS =====
async function addRule() {
    const rule = document.getElementById('newRule').value;
    if (!rule) {
        alert('Digite uma regra!');
        return;
    }
    
    try {
        const snapshot = await db.collection('rules').get();
        const ordem = snapshot.size;
        
        await db.collection('rules').add({
            text: rule,
            ordem: ordem
        });
        
        document.getElementById('newRule').value = '';
        loadData();
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

async function deleteRule(id) {
    if (confirm('Remover esta regra?')) {
        await db.collection('rules').doc(id).delete();
        loadData();
    }
}

// ===== FUNÇÕES DOS VÍDEOS =====
async function addVideo(categoria) {
    let url, titulo, autor;
    
    if (categoria === 'gameplay') {
        url = document.getElementById('newGameplayUrl').value;
        titulo = document.getElementById('newGameplayTitle').value;
        autor = document.getElementById('newGameplayAuthor').value;
    } else {
        url = document.getElementById('newTutorialUrl').value;
        titulo = document.getElementById('newTutorialTitle').value;
        autor = document.getElementById('newTutorialAuthor').value;
    }
    
    if (!url) {
        alert('Digite uma URL válida!');
        return;
    }
    
    try {
        const snapshot = await db.collection('videos').get();
        const ordem = snapshot.size;
        
        await db.collection('videos').add({
            url: url,
            titulo: titulo || 'Sem título',
            autor: autor || 'Desconhecido',
            categoria: categoria,
            ordem: ordem
        });
        
        if (categoria === 'gameplay') {
            document.getElementById('newGameplayUrl').value = '';
            document.getElementById('newGameplayTitle').value = '';
            document.getElementById('newGameplayAuthor').value = '';
        } else {
            document.getElementById('newTutorialUrl').value = '';
            document.getElementById('newTutorialTitle').value = '';
            document.getElementById('newTutorialAuthor').value = '';
        }
        
        loadData();
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

async function deleteVideo(id) {
    if (confirm('Remover este vídeo?')) {
        await db.collection('videos').doc(id).delete();
        loadData();
    }
}

// ===== FUNÇÕES DE CONFIGURAÇÃO =====
async function saveAllChanges() {
    try {
        await db.collection('config').doc('geral').set({
            siteTitle: document.getElementById('editSiteTitle').value,
            siteDescription: document.getElementById('editSiteDescription').value,
            ip: document.getElementById('editServerIP').value,
            version: document.getElementById('editVersion').value,
            about: document.getElementById('editAbout').value,
            discord: document.getElementById('editDiscord').value,
            email: document.getElementById('editEmail').value,
            footer: document.getElementById('editFooter').value,
            modsLink: document.getElementById('editModsLink').value
        });
        
        alert('✅ Configurações salvas!');
        loadData();
    } catch (error) {
        alert('Erro ao salvar: ' + error.message);
    }
}

// ===== FUNÇÕES DE UTILIDADE =====
function copyIP() {
    const ip = document.getElementById('server-ip-display').textContent;
    navigator.clipboard.writeText(ip).then(() => {
        alert("IP copiado: " + ip);
    });
}

function updatePlayers() {
    document.getElementById('players').textContent = Math.floor(Math.random() * 100);
}

// ===== FUNÇÃO PRINCIPAL DE CARREGAR DADOS =====
async function loadData() {
    try {
        // Carregar configurações
        const configDoc = await db.collection('config').doc('geral').get();
        if (configDoc.exists) {
            const data = configDoc.data();
            document.getElementById('site-title').textContent = data.siteTitle || '⚡ DraxenBR ⚡';
            document.getElementById('site-description').textContent = data.siteDescription || 'O servidor mais épico de Minecraft!';
            document.getElementById('server-ip-display').textContent = data.ip || 'sp-16.raze.host:25625';
            document.getElementById('version-text').textContent = data.version || '1.20.4';
            document.getElementById('about-text').textContent = data.about || 'Servidor Minecraft';
            document.getElementById('discord-link').textContent = data.discord || 'https://discord.gg/eQ4exVGPJw';
            document.getElementById('discord-link').href = data.discord || 'https://discord.gg/eQ4exVGPJw';
            document.getElementById('discord-button').href = data.discord || 'https://discord.gg/eQ4exVGPJw';
            document.getElementById('contact-email').textContent = data.email || 'contato@draxenbr.com';
            document.getElementById('footer-text').textContent = data.footer || '© 2024 DraxenBR';
            
            const downloadLink = document.getElementById('download-link');
            if (data.modsLink) {
                downloadLink.href = data.modsLink;
                document.getElementById('downloads-text').textContent = 'Clique para baixar os mods:';
            }
            
            if (isAdminMode) {
                document.getElementById('editSiteTitle').value = data.siteTitle || '';
                document.getElementById('editSiteDescription').value = data.siteDescription || '';
                document.getElementById('editServerIP').value = data.ip || '';
                document.getElementById('editVersion').value = data.version || '';
                document.getElementById('editAbout').value = data.about || '';
                document.getElementById('editDiscord').value = data.discord || '';
                document.getElementById('editEmail').value = data.email || '';
                document.getElementById('editFooter').value = data.footer || '';
                document.getElementById('editModsLink').value = data.modsLink || '';
            }
        }
        
        // Carregar features
        const features = await db.collection('features').orderBy('ordem').get();
        const featuresContainer = document.getElementById('features-container');
        featuresContainer.innerHTML = '';
        const featuresList = document.getElementById('features-list');
        if (featuresList) featuresList.innerHTML = '';
        
        features.forEach(doc => {
            const f = doc.data();
            featuresContainer.innerHTML += `
                <div class="feature-card">
                    <h3>${f.title}</h3>
                    <p>${f.desc}</p>
                </div>
            `;
            
            if (isAdminMode && featuresList) {
                featuresList.innerHTML += `
                    <div class="editable-item">
                        <div><strong>${f.title}</strong><br><small>${f.desc}</small></div>
                        <button class="btn btn-small btn-danger" onclick="deleteFeature('${doc.id}')">🗑️</button>
                    </div>
                `;
            }
        });
        
        // Carregar regras
        const rules = await db.collection('rules').orderBy('ordem').get();
        const rulesContainer = document.getElementById('rules-container');
        rulesContainer.innerHTML = '';
        const rulesList = document.getElementById('rules-list');
        if (rulesList) rulesList.innerHTML = '';
        
        rules.forEach(doc => {
            const r = doc.data();
            rulesContainer.innerHTML += `<li>${r.text}</li>`;
            if (isAdminMode && rulesList) {
                rulesList.innerHTML += `
                    <div class="editable-item">
                        <div>${r.text}</div>
                        <button class="btn btn-small btn-danger" onclick="deleteRule('${doc.id}')">🗑️</button>
                    </div>
                `;
            }
        });
        
        // Carregar imagens da galeria
        const images = await db.collection('images').orderBy('ordem').get();
        const galleryContainer = document.getElementById('gallery-container');
        galleryContainer.innerHTML = '';
        const imagesList = document.getElementById('images-list');
        if (imagesList) imagesList.innerHTML = '';
        
        images.forEach(doc => {
            const img = doc.data().url;
            galleryContainer.innerHTML += `
                <div class="gallery-item">
                    <img src="${img}" alt="Screenshot">
                </div>
            `;
            
            if (isAdminMode && imagesList) {
                imagesList.innerHTML += `
                    <div class="editable-item">
                        <div><img src="${img}" style="width:50px; height:50px; object-fit:cover;"> ${img.substring(0,30)}...</div>
                        <button class="btn btn-small btn-danger" onclick="deleteImage('${doc.id}')">🗑️</button>
                    </div>
                `;
            }
        });
        
        // Carregar vídeos
        const videos = await db.collection('videos').orderBy('ordem').get();
        const gameplaysContainer = document.getElementById('gameplays-container');
        const tutoriaisContainer = document.getElementById('tutoriais-container');
        gameplaysContainer.innerHTML = '';
        tutoriaisContainer.innerHTML = '';
        
        const gameplaysList = document.getElementById('gameplays-list');
        const tutoriaisList = document.getElementById('tutoriais-list');
        if (gameplaysList) gameplaysList.innerHTML = '';
        if (tutoriaisList) tutoriaisList.innerHTML = '';
        
        videos.forEach(doc => {
            const v = doc.data();
            const videoId = getYouTubeId(v.url);
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
            
            const videoCard = `
                <div class="video-card">
                    <div class="video-thumbnail">
                        <img src="${thumbnailUrl}" alt="${v.titulo || 'Vídeo'}">
                    </div>
                    <h4>${v.titulo || 'Sem título'}</h4>
                    <p>Por: ${v.autor || 'Desconhecido'}</p>
                    <a href="${v.url}" target="_blank" class="video-link">🎬 ASSISTIR</a>
                </div>
            `;
            
            if (v.categoria === 'gameplay') {
                gameplaysContainer.innerHTML += videoCard;
            } else {
                tutoriaisContainer.innerHTML += videoCard;
            }
            
            if (isAdminMode) {
                const listItem = `
                    <div class="editable-item">
                        <div>
                            <strong>${v.titulo || 'Sem título'}</strong><br>
                            <small>${v.autor || 'Desconhecido'} - ${v.categoria}</small>
                        </div>
                        <button class="btn btn-small btn-danger" onclick="deleteVideo('${doc.id}')">🗑️</button>
                    </div>
                `;
                
                if (v.categoria === 'gameplay' && gameplaysList) {
                    gameplaysList.innerHTML += listItem;
                } else if (tutoriaisList) {
                    tutoriaisList.innerHTML += listItem;
                }
            }
        });
        
        // Carregar artigos da Wiki
        const wiki = await db.collection('wiki').orderBy('ordem').get();
        const wikiContainer = document.getElementById('wiki-articles');
        wikiContainer.innerHTML = '';
        const wikiList = document.getElementById('wiki-list');
        if (wikiList) wikiList.innerHTML = '';
        
        wiki.forEach(doc => {
            const w = doc.data();
            
            const wikiArticle = `
                <div class="wiki-article">
                    ${w.imagem ? `
                        <div class="wiki-article-image">
                            <img src="${w.imagem}" alt="${w.titulo}">
                        </div>
                    ` : ''}
                    <div class="wiki-article-content">
                        <h3>${w.titulo}</h3>
                        <p>${w.descricao}</p>
                        ${w.link ? `<a href="${w.link}" target="_blank" class="wiki-article-link">🔗 Saiba mais</a>` : ''}
                    </div>
                </div>
            `;
            wikiContainer.innerHTML += wikiArticle;
            
            if (isAdminMode && wikiList) {
                wikiList.innerHTML += `
                    <div class="editable-item">
                        <div>
                            <strong>${w.titulo}</strong><br>
                            <small>${w.descricao.substring(0, 50)}...</small>
                            ${w.imagem ? '<br><img src="' + w.imagem + '" style="width:50px; height:50px; object-fit:cover;">' : ''}
                        </div>
                        <button class="btn btn-small btn-danger" onclick="deleteWikiArticle('${doc.id}')">🗑️</button>
                    </div>
                `;
            }
        });
        
    } catch (error) {
        console.error('Erro ao carregar:', error);
    }
}

// Inicialização
loadData();
setInterval(updatePlayers, 30000);
updatePlayers();

// Rolagem suave
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({behavior: 'smooth'});
    });
});

// Fechar com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideLoginModal();
});

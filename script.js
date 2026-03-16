// CONFIGURAÇÃO DO FIREBASE - COLE A SUA AQUI!
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

// Configurar persistência de login
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Verificar se já está logado
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

// Funções de Login
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
        console.error('Erro no login:', error);
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

// Função para extrair ID do YouTube
function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Carregar dados do Firebase
async function loadData() {
    try {
        // Carregar configurações gerais
        const configDoc = await db.collection('config').doc('geral').get();
        if (configDoc.exists) {
            const data = configDoc.data();
            document.getElementById('site-title').textContent = data.siteTitle || '⚡ DraxenBR ⚡';
            document.getElementById('site-description').textContent = data.siteDescription || 'O servidor mais épico de Minecraft!';
            document.getElementById('server-ip-display').textContent = data.ip || 'sp-16.raze.host:25625';
            document.getElementById('version-text').textContent = data.version || '1.20.4';
            document.getElementById('about-text').textContent = data.about || 'DraxenBR é um servidor feito para a comunidade brasileira, com foco em diversão e amizade!';
            document.getElementById('discord-link').textContent = data.discord || 'https://discord.gg/eQ4exVGPJw';
            document.getElementById('discord-link').href = data.discord || 'https://discord.gg/eQ4exVGPJw';
            document.getElementById('discord-button').href = data.discord || 'https://discord.gg/eQ4exVGPJw';
            document.getElementById('contact-email').textContent = data.email || 'contato@draxenbr.com';
            document.getElementById('footer-text').textContent = data.footer || '© 2024 DraxenBR. Todos os direitos reservados.';
            
            // Link dos mods
            const downloadLink = document.getElementById('download-link');
            if (data.modsLink) {
                downloadLink.href = data.modsLink;
                document.getElementById('downloads-text').textContent = 'Clique no botão abaixo para baixar os mods do servidor:';
            } else {
                downloadLink.href = '#';
                document.getElementById('downloads-text').textContent = 'Nenhum link disponível no momento.';
            }
            
            // Conteúdo da Wiki
            document.getElementById('wiki-content').innerHTML = data.wikiContent || '<p>Conteúdo da wiki em breve...</p>';
            
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
                document.getElementById('editWikiContent').value = data.wikiContent || '';
            }
        }
        
        // Carregar features
        const featuresSnapshot = await db.collection('features').orderBy('ordem').get();
        const featuresContainer = document.getElementById('features-container');
        featuresContainer.innerHTML = '';
        const featuresList = document.getElementById('features-list');
        if (featuresList) featuresList.innerHTML = '';
        
        featuresSnapshot.forEach((doc) => {
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
        const rulesSnapshot = await db.collection('rules').orderBy('ordem').get();
        const rulesContainer = document.getElementById('rules-container');
        rulesContainer.innerHTML = '';
        const rulesList = document.getElementById('rules-list');
        if (rulesList) rulesList.innerHTML = '';
        
        rulesSnapshot.forEach((doc) => {
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
        
        // Carregar imagens
        const imagesSnapshot = await db.collection('images').orderBy('ordem').get();
        const galleryContainer = document.getElementById('gallery-container');
        galleryContainer.innerHTML = '';
        const imagesList = document.getElementById('images-list');
        if (imagesList) imagesList.innerHTML = '';
        
        imagesSnapshot.forEach((doc) => {
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
        const videosSnapshot = await db.collection('videos').orderBy('ordem').get();
        const gameplaysContainer = document.getElementById('gameplays-container');
        const tutoriaisContainer = document.getElementById('tutoriais-container');
        gameplaysContainer.innerHTML = '';
        tutoriaisContainer.innerHTML = '';
        
        const gameplaysList = document.getElementById('gameplays-list');
        const tutoriaisList = document.getElementById('tutoriais-list');
        if (gameplaysList) gameplaysList.innerHTML = '';
        if (tutoriaisList) tutoriaisList.innerHTML = '';
        
        videosSnapshot.forEach((doc) => {
            const v = doc.data();
            const videoId = getYouTubeId(v.url);
            const

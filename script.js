// CONFIGURAÇÃO DO FIREBASE - USE A SUA AQUI!
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
        // Usuário está logado
        isAdminMode = true;
        document.body.classList.add('admin-mode');
        document.getElementById('adminPanel').classList.add('active');
        document.getElementById('overlay').classList.remove('active');
        loadData();
    } else {
        // Usuário não está logado
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
        // Login bem-sucedido - onAuthStateChanged vai cuidar do resto
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
        loadData(); // Recarrega sem modo admin
    });
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
            document.getElementById('about-text').textContent = data.about || 'DraxenBR é um servidor feito para a comunidade brasileira, com foco em diversão e amizade! Temos diversos modos de jogo e eventos especiais.';
            document.getElementById('discord-link').textContent = data.discord || 'https://discord.gg/eQ4exVGPJw';
            document.getElementById('discord-link').href = data.discord || 'https://discord.gg/eQ4exVGPJw';
            document.getElementById('discord-button').href = data.discord || 'https://discord.gg/eQ4exVGPJw';
            document.getElementById('contact-email').textContent = data.email || 'contato@draxenbr.com';
            document.getElementById('footer-text').textContent = data.footer || '© 2024 DraxenBR. Todos os direitos reservados.';
            
            if (isAdminMode) {
                document.getElementById('editSiteTitle').value = data.siteTitle || '';
                document.getElementById('editSiteDescription').value = data.siteDescription || '';
                document.getElementById('editServerIP').value = data.ip || '';
                document.getElementById('editVersion').value = data.version || '';
                document.getElementById('editAbout').value = data.about || '';
                document.getElementById('editDiscord').value = data.discord || '';
                document.getElementById('editEmail').value = data.email || '';
                document.getElementById('editFooter').value = data.footer || '';
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
        
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

// Funções de salvamento
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
            footer: document.getElementById('editFooter').value
        });
        
        alert('✅ Dados salvos! Todos os visitantes verão as alterações.');
        loadData();
    } catch (error) {
        alert('Erro ao salvar: ' + error.message);
    }
}

async function addFeature() {
    const title = document.getElementById('newFeatureTitle').value;
    const desc = document.getElementById('newFeatureDesc').value;
    
    if (title && desc) {
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
}

async function deleteFeature(id) {
    if (confirm('Remover esta feature?')) {
        await db.collection('features').doc(id).delete();
        loadData();
    }
}

async function addRule() {
    const rule = document.getElementById('newRule').value;
    if (rule) {
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
}

async function deleteRule(id) {
    if (confirm('Remover esta regra?')) {
        await db.collection('rules').doc(id).delete();
        loadData();
    }
}

async function addImage() {
    const url = document.getElementById('newImageUrl').value;
    if (url) {
        try {
            const snapshot = await db.collection('images').get();
            const ordem = snapshot.size;
            
            await db.collection('images').add({
                url: url,
                ordem: ordem
            });
            
            document.getElementById('newImageUrl').value = '';
            loadData();
        } catch (error) {
            alert('Erro: ' + error.message);
        }
    }
}

async function deleteImage(id) {
    if (confirm('Remover esta imagem?')) {
        await db.collection('images').doc(id).delete();
        loadData();
    }
}

function copyIP() {
    const ip = document.getElementById('server-ip-display').textContent;
    navigator.clipboard.writeText(ip).then(() => {
        alert("IP copiado: " + ip);
    });
}

function updatePlayers() {
    document.getElementById('players').textContent = Math.floor(Math.random() * 100);
}

// Inicialização
loadData();
setInterval(updatePlayers, 30000);
updatePlayers();

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({behavior: 'smooth'});
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideLoginModal();
    }
});

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
const storage = firebase.storage();

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

// Upload de Imagem
async function uploadImage() {
    const file = document.getElementById('imageUpload').files[0];
    if (!file) {
        alert('Selecione uma imagem primeiro!');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB!');
        return;
    }
    
    try {
        const storageRef = storage.ref();
        const imageRef = storageRef.child(`galeria/${Date.now()}_${file.name}`);
        await imageRef.put(file);
        const url = await imageRef.getDownloadURL();
        
        const snapshot = await db.collection('images').get();
        const ordem = snapshot.size;
        
        await db.collection('images').add({
            url: url,
            ordem: ordem
        });
        
        document.getElementById('imageUpload').value = '';
        loadData();
        alert('✅ Imagem enviada com sucesso!');
    } catch (error) {
        alert('Erro ao enviar imagem: ' + error.message);
    }
}

// Upload de imagem para Wiki
async function uploadWikiImage() {
    const file = document.getElementById('wikiImageUpload').files[0];
    if (!file) return null;
    
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB!');
        return null;
    }
    
    try {
        const storageRef = storage.ref();
        const imageRef = storageRef.child(`wiki/${Date.now()}_${file.name}`);
        await imageRef.put(file);
        return await imageRef.getDownloadURL();
    } catch (error) {
        alert('Erro ao enviar imagem: ' + error.message);
        return null;
    }
}

// Adicionar artigo na Wiki
async function addWikiArticle() {
    const title = document.getElementById('newWikiTitle').value;
    const desc = document.getElementById('newWikiDesc').value;
    const link = document.getElementById('newWikiLink').value;
    
    if (!title || !desc) {
        alert('Preencha título e descrição!');
        return;
    }
    
    try {
        const imageUrl = await uploadWikiImage();
        
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
        document.getElementById('wikiImageUpload').value = '';
        
        loadData();
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

// Deletar artigo da Wiki
async function deleteWikiArticle(id) {
    if (confirm('Remover este artigo?')) {
        await db.collection('wiki').doc(id).delete();
        loadData();
    }
}

// Carregar dados
async function loadData() {
    try {
        // Configurações
        const configDoc = await db.collection('config').doc('geral').get();
        if (configDoc.exists) {
            const data = configDoc.data();
            document.getElementById('site-title').textContent = data.siteTitle || '⚡ DraxenBR ⚡';
            document.getElementById('site-description').textContent = data.siteDescription || 'O servidor mais épico de Minecraft!';
            document.getElementById('server-ip-display').textContent = data.ip || 'sp-16.raze.host:25625';
            document.getElementById('version-text').textContent = data.version || '1.20.4';
            document.getElementById('about-text').textContent = data.about || 'DraxenBR é um servidor feito para a comunidade brasileira!';
            document.getElementById('discord-link').textContent = data.discord || 'https://discord.gg/eQ4exVGPJw';
            document.getElementById('discord-link').href = data.discord || 'https://discord.gg/eQ4exVGPJw';
            document.getElementById('discord-button').href = data.discord || 'https://discord.gg/eQ4exVGPJw';
            document.getElementById('contact-email').textContent = data.email || 'contato@draxenbr.com';
            document.getElementById('footer-text').textContent = data.footer || '© 2024 DraxenBR';
            
            const downloadLink = document.getElementById('download-link');
            if (data.modsLink) {
                downloadLink.href = data.modsLink;
                document.getElementById('downloads-text').textContent = 'Clique no botão abaixo para baixar os mods:';
            } else {
                downloadLink.href = '#';
                document.getElementById('downloads-text').textContent = 'Nenhum link disponível.';
            }
            
            if (isAdminMode) {
                document.getElementById('editSiteTitle').value = data.siteTitle || '';
                document.getElementById('editSiteDescription').value = data.siteDescription || '';
                document.getElementById('editServerIP').value = data.ip || '';
                document.getElementById('editVersion').value = data.version || '';
                document.getElementById('editAbout').value = data.about || '';

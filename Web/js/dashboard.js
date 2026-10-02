// Sayfa açıldığında bugünün tarihini üst çubuğa yazdır
document.addEventListener('DOMContentLoaded', () => {
    const dateElement = document.getElementById('currentDate');
    const today = new Date();
    dateElement.textContent = 'Tarih: ' + today.toLocaleDateString('tr-TR');
});

// Menü sekmeleri arasında geçiş yapma fonksiyonu
function showTab(tabId, clickedElement) {
    // Tüm içerikleri gizle
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active-tab');
    });

    // Sadece tıklanan içeriği göster
    document.getElementById(tabId).classList.add('active-tab');

    // Sol menüdeki aktif (mavi çizgili) durumu güncelle
    const navItems = document.querySelectorAll('.nav-links li');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Tıklanan menü elemanını aktif yap
    clickedElement.classList.add('active');
}

// Çıkış yap butonu fonksiyonu
function logout() {
    if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
        // Çıkış yapınca ana giriş ekranına geri dön
        window.location.href = "index.html"; 
    }
}

// todo - Takımlar kısmının veri ekleme alanının kodları

// SAHTE VERİTABANI (Demo sunumunda dolu gözükmesi için başlangıç verileri)
let teams = ["Kargıpınarı", "Çeşmeli", "Tömük"];
let disqualifiedTeams = [];
let players = [
    { id: 1, name: "Ali Yılmaz", team: "Kargıpınarı", goals: 2, assists: 1 },
    { id: 2, name: "Mehmet Can", team: "Çeşmeli", goals: 0, assists: 3 }
];

// Sayfa yüklendiğinde mevcut takımları ve tabloyu ekrana çiz
document.addEventListener('DOMContentLoaded', () => {
    updateTeamSelect();
    renderTeamTable();
    renderPlayerTable();
    updateKnockoutSelects();
});

// TAKIM EKLEME FONKSİYONU (Güncellenmiş - Çift İsim Kontrollü)
function addTeam() {
    const teamInput = document.getElementById('teamName');
    const teamName = teamInput.value.trim();

    if (teamName !== "") {
        // YENİ KONTROL: Bu isimde bir takım zaten var mı?
        // toLowerCase() ile harf büyüklüğüne bakmaksızın (örn: kargıpınarı == Kargıpınarı) kontrol ederiz
        const isDuplicate = teams.some(t => t.toLowerCase() === teamName.toLowerCase());
        
        if (isDuplicate) {
            alert("HATA: '" + teamName + "' adında bir takım zaten mevcut!");
            return; // Fonksiyonu burada durdur, ekleme yapma!
        }

        teams.push(teamName);
        teamInput.value = ""; 
        document.getElementById('managerName').value = ""; 
        updateTeamSelect(); 
        renderTeamTable(); // Eklenen takım anında tabloya düşsün
        
        // Eğer Gruplar sekmesi açıksa oradaki açılır menüleri de güncelleyelim
        if(groups.length > 0) renderGroups(); 
        
        updateKnockoutSelects(); // Eleme ağacı açılır menülerini de güncelle
        alert(teamName + " takımı başarıyla eklendi!");
    } else {
        alert("Lütfen bir takım adı girin!");
    }
}

// OYUNCU EKLEME FONKSİYONU
function addPlayer() {
    const teamSelect = document.getElementById('teamSelect');
    const playerInput = document.getElementById('playerName');
    const playerName = playerInput.value.trim();
    const selectedTeam = teamSelect.value;

    if (playerName !== "" && selectedTeam !== "") {
        const newPlayer = {
            id: Date.now(), // Benzersiz ID oluştur
            name: playerName,
            team: selectedTeam,
            goals: 0,
            assists: 0
        };
        players.push(newPlayer);
        playerInput.value = ""; // Kutuyu temizle
        renderPlayerTable(); // Tabloyu anında güncelle
    } else {
        alert("Lütfen bir takım seçin ve oyuncu adını girin!");
    }
}

// TAKIMLARI AÇILIR MENÜYE (SELECT) DOLDUR
function updateTeamSelect() {
    const select = document.getElementById('teamSelect');
    select.innerHTML = '<option value="">Takım Seçin...</option>'; // Önce temizle
    
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        select.appendChild(option);
    });
}

function renderPlayerTable() {
    const tbody = document.getElementById('playerTableBody');
    tbody.innerHTML = ""; 

    players.forEach(player => {
        if(player.penalty === undefined) player.penalty = 0;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${player.name}</strong></td>
            <td>${player.team}</td>
            
            <!-- GOL STEPPER -->
            <td>
                <div class="stat-stepper">
                    <button class="stepper-btn goal" onclick="updateStat(${player.id}, 'goal', -1)">-</button>
                    <span class="stat-value" style="color: #06b6d4;">${player.goals}</span>
                    <button class="stepper-btn goal" onclick="updateStat(${player.id}, 'goal', 1)">+</button>
                </div>
            </td>
            
            <!-- ASİST STEPPER -->
            <td>
                <div class="stat-stepper">
                    <button class="stepper-btn assist" onclick="updateStat(${player.id}, 'assist', -1)">-</button>
                    <span class="stat-value" style="color: #8b5cf6;">${player.assists}</span>
                    <button class="stepper-btn assist" onclick="updateStat(${player.id}, 'assist', 1)">+</button>
                </div>
            </td>
            
            <!-- CEZA STEPPER -->
            <td>
                <div class="stat-stepper">
                    <button class="stepper-btn penalty" onclick="updateStat(${player.id}, 'penalty', -1)">-</button>
                    <span class="stat-value" style="color: #ef4444;">${player.penalty}</span>
                    <button class="stepper-btn penalty" onclick="updateStat(${player.id}, 'penalty', 1)">+</button>
                </div>
            </td>
            
            <!-- SADECE SİLME BUTONU KALDI -->
            <td>
                <button class="mini-btn btn-delete" style="margin: 0; padding: 6px 12px;" onclick="deletePlayer(${player.id})">Sil</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateStat(playerId, type, amount) {
    const player = players.find(p => p.id === playerId);
    if (player) {
        if (type === 'goal') {
            player.goals += amount;
            if (player.goals < 0) player.goals = 0; 
        } else if (type === 'assist') {
            player.assists += amount;
            if (player.assists < 0) player.assists = 0;
        } else if (type === 'penalty') {
            if(player.penalty === undefined) player.penalty = 0;
            player.penalty += amount;
            if (player.penalty < 0) player.penalty = 0;
        }
        renderPlayerTable();
    }
}

// OYUNCUYU TAMAMEN SİLME FONKSİYONU
function deletePlayer(playerId) {
    // Admine "Emin misin?" diye soralım
    if (confirm("Bu oyuncuyu silmek istediğinize emin misiniz?")) {
        // İlgili oyuncuyu diziden çıkar
        players = players.filter(p => p.id !== playerId);
        renderPlayerTable(); // Tabloyu anında güncelle
    }
}

// todo - Grup kısmı fonksiyonları
// --- GRUP YÖNETİMİ DEĞİŞKENLERİ ---
let groups = []; // Oluşturulan grupları tutacak
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Otomatik harf atamak için

// YENİ GRUP OLUŞTURMA FONKSİYONU
function createNewGroup() {
    const nextIndex = groups.length;
    
    // Alfabedeki harf sayısını geçerse uyar
    if (nextIndex >= alphabet.length) {
        alert("Maksimum grup sayısına ulaştınız!");
        return;
    }

    const groupName = alphabet[nextIndex] + " Grubu";
    
    // Yeni grubu listeye ekle (İçindeki takımlar başlangıçta boş)
    groups.push({
        id: nextIndex,
        name: groupName,
        assignedTeams: []
    });

    renderGroups(); // Ekranı güncelle
}

// GRUPLARI EKRANA ÇİZME FONKSİYONU (Güncellenmiş - Diskalifiye Kontrollü)
function renderGroups() {
    const container = document.getElementById('groupsContainer');
    if (!container) return; // Sayfada yoksa hata vermesin
    
    container.innerHTML = ""; 

    groups.forEach((group, index) => {
        let optionsHtml = '<option value="">Boştaki Bir Takımı Seç...</option>';
        
        teams.forEach(team => {
            // YENİ KONTROL: Takım grupta DEĞİLSE ve DİSKALİFİYE DEĞİLSE menüye ekle!
            if (!isTeamAssignedToAnyGroup(team) && !disqualifiedTeams.includes(team)) {
                optionsHtml += `<option value="${team}">${team}</option>`;
            }
        });

        let teamsHtml = '';
        group.assignedTeams.forEach(team => {
            teamsHtml += `
                <li>
                    ${team} 
                    <button class="mini-btn btn-decrease" onclick="removeTeamFromGroup(${index}, '${team}')">Çıkar</button>
                </li>`;
        });

        const groupHtml = `
            <div class="group-card">
                <div class="group-card-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>${group.name}</span>
                    <button class="mini-btn btn-delete" style="margin:0;" onclick="deleteGroup(${index})">Sil</button>
                </div>
                <div class="group-card-body">
                    <div class="group-add-section">
                        <select id="select-group-${index}" class="custom-select">
                            ${optionsHtml}
                        </select>
                        <button class="action-btn" style="width: auto; margin: 0; padding: 10px 15px;" onclick="addTeamToGroup(${index})">Ekle</button>
                    </div>
                    <ul class="group-team-list">
                        ${teamsHtml}
                    </ul>
                </div>
            </div>
        `;
        
        container.innerHTML += groupHtml;
    });
}
// GRUBA TAKIM EKLEME FONKSİYONU
function addTeamToGroup(groupIndex) {
    const selectElement = document.getElementById(`select-group-${groupIndex}`);
    const selectedTeam = selectElement.value;

    if (selectedTeam === "") {
        alert("Lütfen bir takım seçin!");
        return;
    }

    const group = groups[groupIndex];

    // Takım zaten bu grupta var mı kontrolü
    if (group.assignedTeams.includes(selectedTeam)) {
        alert("Bu takım zaten bu grupta!");
        return;
    }

    // Takımı gruba ekle ve ekranı güncelle
    group.assignedTeams.push(selectedTeam);
    renderGroups();
}

// GRUPTAN TAKIM ÇIKARMA FONKSİYONU
function removeTeamFromGroup(groupIndex, teamName) {
    const group = groups[groupIndex];
    // Seçilen takımı diziden filtreleyerek çıkar
    group.assignedTeams = group.assignedTeams.filter(t => t !== teamName);
    renderGroups(); // Ekranı güncelle
}

// YARDIMCI FONKSİYON: Bir takım herhangi bir gruba atanmış mı?
function isTeamAssignedToAnyGroup(teamName) {
    // Tüm grupları gezer, eğer takım atanmışsa true (evet), atanmamışsa false (hayır) döndürür
    return groups.some(group => group.assignedTeams.includes(teamName));
}

// GRUBU SİLME FONKSİYONU
function deleteGroup(index) {
    const groupName = groups[index].name;
    
    if (confirm(`${groupName} panosunu silmek istediğinize emin misiniz? (İçindeki takımlar boşa çıkacaktır.)`)) {
        // Grubu diziden çıkar
        groups.splice(index, 1);
        
        // Kalan grupların isimlerini (A, B, C diye) sırayı bozmadan yeniden adlandır
        groups.forEach((g, i) => {
            g.id = i;
            g.name = alphabet[i] + " Grubu";
        });
        
        renderGroups(); // Ekranı güncelle
    }
}

// todo - Eleme alanı fonksiyonları

// --- ELEME AĞACI DEĞİŞKENLERİ ---
let matches = []; // Tüm maçları tutacak dizi

// Aşamaların büyüklük sırası (Hangi tur hangisinden sonra geliyor bilmemiz lazım)
const stageOrder = ["Son 32", "Son 16", "Çeyrek Final", "Yarı Final", "Final"];

// YARDIMCI FONKSİYON: Seçilen tura kadar elenmiş olan takımları bulur
function getEliminatedTeams(currentStage) {
    let eliminated = [];
    let currentIndex = stageOrder.indexOf(currentStage);

    // Bütün maçları tara
    matches.forEach(match => {
        let matchStageIndex = stageOrder.indexOf(match.stage);
        
        // Eğer maç, şu an bulunduğumuz turdan DAHA ÖNCEKİ bir turdaysa (örn: Biz Son 16'dayız, maç Son 32'de oynanmışsa)
        if (matchStageIndex < currentIndex) {
            // Eğer maça skor girilmişse (boş değilse)
            if (match.score1 !== "" && match.score2 !== "") {
                let s1 = parseInt(match.score1);
                let s2 = parseInt(match.score2);
                
                // Kaybedeni elenenler listesine ekle
                if (s1 < s2) eliminated.push(match.team1);
                if (s2 < s1) eliminated.push(match.team2);
            }
        }
    });
    
    return eliminated;
}
// SEÇENEKLERİ GÜNCELLEME (Takım eklendikçe Eleme seçicilerini de doldurur)
document.addEventListener('DOMContentLoaded', () => {
    updateKnockoutSelects(); 
});

// ELEME SEÇENEKLERİNİ GÜNCELLEME (Güncellenmiş - Diskalifiye Kontrollü)
function updateKnockoutSelects() {
    const t1 = document.getElementById('team1Select');
    const t2 = document.getElementById('team2Select');
    const stageSelect = document.getElementById('stageSelect');
    
    if(!t1 || !t2 || !stageSelect) return;

    const currentStage = stageSelect.value;
    const eliminatedTeams = getEliminatedTeams(currentStage);

    let alreadyScheduledTeams = [];
    matches.forEach(match => {
        if (match.stage === currentStage) {
            alreadyScheduledTeams.push(match.team1);
            alreadyScheduledTeams.push(match.team2);
        }
    });

    let options = '<option value="">Takım Seç...</option>';
    
    teams.forEach(team => {
        if (!eliminatedTeams.includes(team) && 
            !alreadyScheduledTeams.includes(team) && 
            !disqualifiedTeams.includes(team)) {
            
            options += `<option value="${team}">${team}</option>`;
        }
    });

    t1.innerHTML = options;
    t2.innerHTML = options;
}
// YENİ EŞLEŞME OLUŞTURMA
function createMatch() {
    const stage = document.getElementById('stageSelect').value;
    const team1 = document.getElementById('team1Select').value;
    const team2 = document.getElementById('team2Select').value;

    if (team1 === "" || team2 === "") {
        alert("Lütfen eşleşecek iki takımı da seçin!");
        return;
    }

    if (team1 === team2) {
        alert("HATA: Bir takım kendisiyle eşleşemez!");
        return;
    }

    // Yeni maçı diziye kaydet
    matches.push({
        id: Date.now(),
        stage: stage,
        team1: team1,
        team2: team2,
        score1: "", // Maç oynanmadıysa boş
        score2: ""
    });

    // Menüleri sıfırla ve maçları ekrana çiz
    document.getElementById('team1Select').value = "";
    document.getElementById('team2Select').value = "";
    renderMatches();
}

// MAÇLARI EKRANA ÇİZ
function renderMatches() {
    updateKnockoutSelects();

    const container = document.getElementById('matchesContainer');
    const currentStage = document.getElementById('stageSelect').value;
    
    container.innerHTML = ""; // Temizle

    // Sadece yukarıdaki açılır menüde seçilen Turun (örn: Çeyrek Final) maçlarını filtrele
    const filteredMatches = matches.filter(m => m.stage === currentStage);

    if (filteredMatches.length === 0) {
        container.innerHTML = `<div class="placeholder-box" style="grid-column: 1 / -1;">${currentStage} için henüz eşleşme girilmedi.</div>`;
        return;
    }

    filteredMatches.forEach(match => {
        const matchHtml = `
            <div class="match-card">
                <div class="match-teams">
                    <div class="team-name" style="text-align: right;">${match.team1}</div>
                    <div class="vs-badge">VS</div>
                    <div class="team-name" style="text-align: left;">${match.team2}</div>
                </div>
                
                <div class="score-inputs">
                    <input type="number" id="score1-${match.id}" class="score-input" value="${match.score1}" placeholder="-">
                    <div class="score-dash">-</div>
                    <input type="number" id="score2-${match.id}" class="score-input" value="${match.score2}" placeholder="-">
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button class="action-btn save-score-btn" onclick="saveScore(${match.id})">Skoru Kaydet</button>
                    <button class="mini-btn btn-delete" style="width: auto; padding: 0 15px;" onclick="deleteMatch(${match.id})">Sil</button>
                </div>
            </div>
        `;
        container.innerHTML += matchHtml;
    });
}

// SKORU KAYDETME FONKSİYONU
function saveScore(matchId) {
    const match = matches.find(m => m.id === matchId);
    if (match) {
        const s1 = document.getElementById(`score1-${matchId}`).value;
        const s2 = document.getElementById(`score2-${matchId}`).value;
        
        match.score1 = s1;
        match.score2 = s2;
        
        alert(`${match.team1} ${s1} - ${s2} ${match.team2} \nSkor başarıyla kaydedildi!`);
        // İleride buraya: "Firebase'e gönder" kodunu yazacağız
    }
}

// MAÇI SİLME FONKSİYONU
function deleteMatch(matchId) {
    if (confirm("Bu eşleşmeyi silmek istediğinize emin misiniz?")) {
        matches = matches.filter(m => m.id !== matchId);
        renderMatches();
    }
}

//! takim diskalifiye komutları

// TAKIMLARI TABLOYA ÇİZ (Diskalifiye Yönetimi)
function renderTeamTable() {
    const tbody = document.getElementById('teamTableBody');
    tbody.innerHTML = "";

    teams.forEach(team => {
        const isDisqualified = disqualifiedTeams.includes(team);
        const statusBadge = isDisqualified 
            ? '<span class="badge-dq">Diskalifiye</span>' 
            : '<span class="badge-active">Aktif</span>';
            
        const actionBtn = isDisqualified
            ? `<button class="btn-undq" onclick="toggleDisqualify('${team}')">Geri Al</button>`
            : `<button class="btn-dq" onclick="toggleDisqualify('${team}')">Diskalifiye Et</button>`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${team}</strong></td>
            <td>${statusBadge}</td>
            <td>${actionBtn}</td>
        `;
        tbody.appendChild(row);
    });
}

// DİSKALİFİYE ET / GERİ AL MANTIĞI
function toggleDisqualify(teamName) {
    const isDisqualified = disqualifiedTeams.includes(teamName);
    
    if (isDisqualified) {
        // Geri al (Diziden çıkar)
        disqualifiedTeams = disqualifiedTeams.filter(t => t !== teamName);
    } else {
        // Diskalifiye et (Onay iste)
        if(confirm(`${teamName} takımını turnuvadan diskalifiye etmek istediğinize emin misiniz? (Kurada görünmezler)`)) {
            disqualifiedTeams.push(teamName);
        }
    }
    
    renderTeamTable(); // Tabloyu yenile
    
    // Sistemdeki açılır menüleri de yenile ki diskalifiye olan takım kura listesinden düşsün
    if(document.getElementById('groupsContainer')) renderGroups(); 
    if(document.getElementById('team1Select')) updateKnockoutSelects();
}
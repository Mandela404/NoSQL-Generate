// Conversor NoSQL Inteligente
function generateNoSQL() {
    try {
        const jsonData = JSON.parse(document.getElementById('jsonInput').value);
        const dbType = document.getElementById('nosqlType').value;
        let nosql = '';

        switch(dbType) {
            case 'mongodb':
                nosql = `db.collection.insertOne(${JSON.stringify(jsonData, null, 2)});`;
                break;
            case 'cassandra':
                nosql = `INSERT INTO table JSON '${JSON.stringify(jsonData)}';`;
                break;
            case 'firestore':
                nosql = `firestore.collection('docs').add(${JSON.stringify(jsonData)});`;
                break;
            case 'dynamodb':
                nosql = `aws dynamodb put-item --table-name Table --item '${JSON.stringify(jsonData)}'`;
                break;
        }

        document.getElementById('nosqlResult').textContent = nosql;
    } catch (error) {
        alert(`Erro: JSON inválido! Detalhes: ${error.message}`);
    }
}

// Gerador de PDF
function generatePDF() {
    const doc = new jspdf.jsPDF();
    const jsonData = document.getElementById('jsonInput').value;
    
    // Tabela de Dados
    const data = Object.entries(JSON.parse(jsonData)).map(([key, value]) => [
        key, 
        typeof value, 
        JSON.stringify(value).substring(0, 20)
    ]);

    doc.autoTable({
        head: [['Chave', 'Tipo', 'Valor']],
        body: data,
        theme: 'grid',
        styles: { fontSize: 10 }
    });

    doc.save('dados-exportados.pdf');
}

// Sistema de Hashing
function generateHash() {
    const input = document.getElementById('jsonInput').value;
    const algorithm = document.getElementById('hashAlgorithm').value;
    
    const hash = CryptoJS[algorithm](input).toString(CryptoJS.enc.Hex);
    document.getElementById('hashResult').textContent = hash;
}

// Funções de UI
function validateJSON() {
    try {
        JSON.parse(document.getElementById('jsonInput').value);
        alert("JSON válido!");
    } catch (error) {
        alert("JSON inválido! Erro: " + error.message);
    }
}

function copyNoSQL() {
    navigator.clipboard.writeText(document.getElementById('nosqlResult').textContent);
}

function copyHash() {
    navigator.clipboard.writeText(document.getElementById('hashResult').textContent);
}
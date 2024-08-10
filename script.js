let codes = [];
let currentPage = 1;
let totalPages = 1;
const itemsPerPage = 5;

document.getElementById('codeInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addCode();
    }
});

document.getElementById('generateExcel').addEventListener('click', generateExcel);
document.getElementById('generatePDF').addEventListener('click', generatePDF);
document.getElementById('clearCodes').addEventListener('click', clearData);
document.getElementById('goToSelection').addEventListener('click', goToSelection);

function addCode() {
    const codeInput = document.getElementById('codeInput');
    const code = codeInput.value.trim();

    if (code) {
        codes.unshift(code); // Insert code at the beginning of the array
        updateCodeList();
        updateCounter();
        updateLastCode(code);
        codeInput.value = '';
    } else {
        alert('Por favor, ingresa una guía.');
    }
}

function updateCodeList() {
    const codeList = document.getElementById('codeList');
    codeList.innerHTML = '';

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, codes.length);

    // Get the codes for the current page
    const pageCodes = codes.slice(startIndex, endIndex);

    // Contar la frecuencia de cada código
    const codeFrequency = {};
    codes.forEach(code => {
        codeFrequency[code] = (codeFrequency[code] || 0) + 1;
    });

    pageCodes.forEach(code => {
        const li = document.createElement('li');
        li.textContent = code;

        // Determinar la clase de fondo según la frecuencia del código
        if (codeFrequency[code] >= 3) {
            li.classList.add('red-bg');
        } else if (codeFrequency[code] === 2) {
            li.classList.add('yellow-bg');
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.className = 'deleteCode';
        deleteBtn.onclick = () => deleteCode(codes.indexOf(code));

        li.appendChild(deleteBtn);
        codeList.appendChild(li);
    });

    updatePagination();
}

function updateCounter() {
    const counter = document.getElementById('counter');
    counter.textContent = codes.length;
}

function updateLastCode(code) {
    const lastCode = document.getElementById('lastCode');
    lastCode.textContent = code;
}

function updatePagination() {
    totalPages = Math.ceil(codes.length / itemsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
    document.getElementById('firstPage').style.display = totalPages > 1 ? 'inline-block' : 'none';
    document.getElementById('lastPage').style.display = totalPages > 3 ? 'inline-block' : 'none';
}

function changePage(direction) {
    currentPage += direction;
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    updateCodeList();
}

function goToPage(page) {
    currentPage = Math.max(1, Math.min(page, totalPages));
    updateCodeList();
}

function deleteCode(index) {
    codes.splice(index, 1);
    updateCodeList();
    updateCounter();
    updateLastCode(codes[codes.length - 1] || 'N/A');
}

function generateExcel() {
    if (codes.length === 0) {
        alert('No hay guías para guardar.');
        return;
    }

    const wb = XLSX.utils.book_new();
    const selectedCompany = localStorage.getItem('selectedCompany') || 'Sin Empresa';
    const ws = XLSX.utils.aoa_to_sheet([
        [`Cantidad de guías: ${codes.length}`],
        [`Guías escaneadas - ${selectedCompany}`],
        [], // Línea en blanco
        ['Guías'] // Título de la columna
    ]);

    codes.forEach(code => {
        XLSX.utils.sheet_add_aoa(ws, [[code]], { origin: -1 });
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Guías escaneadas');
    XLSX.writeFile(wb, getFileName('xlsx'));
}

function generatePDF() {
    if (codes.length === 0) {
        alert('No hay guías para guardar.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const selectedCompany = localStorage.getItem('selectedCompany') || 'Sin Empresa';


    doc.text(`Cantidad de guías: ${codes.length}`, 10, 20);
    doc.text(`Guías escaneadas - ${selectedCompany}`, 10, 10);

    codes.forEach((code, index) => {
        doc.text(code, 10, 30 + (index * 10));
    });

    doc.save(getFileName('pdf'));
}

function clearData() {
    codes = [];
    updateCodeList();
    updateCounter();
    updateLastCode('N/A');
}

function goToSelection() {
    window.location.href = 'selection.html';
}

function getFileName(extension) {
    const selectedCompany = localStorage.getItem('selectedCompany') || 'Sin Empresa';
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0]; // yyyy-mm-dd
    const hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `Entrega de Guías - ${selectedCompany} - ${formattedDate} ${ampm}.${extension}`;
}

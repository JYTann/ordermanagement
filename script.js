document.addEventListener('DOMContentLoaded', () => {
    loadRecords(); // Load records on page load

    document.getElementById('add-row').addEventListener('click', function () {
        addRow();
    });

    document.querySelector('#order-table').addEventListener('click', function (e) {
        const row = e.target.closest('tr');
        if (e.target.classList.contains('delete-row')) {
            row.remove();
            saveRecords();
            updateGrandTotal();
        } else if (e.target.classList.contains('edit-row')) {
            editRow(row);
        }
    });

    document.getElementById('capture-pdf').addEventListener('click', function () {
        const captureArea = document.querySelector('#capture-area');
        html2canvas(captureArea).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF();
            const imgWidth = 190; // Width of the PDF page in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save('order-summary.pdf');
        }).catch(error => {
            console.error('Error generating PDF:', error);
        });
    });
});

function addRow() {
    const date = document.getElementById('date').value;
    const content = document.getElementById('content').value;
    const orderNumber = document.getElementById('order-number').value;
    const quantity = parseFloat(document.getElementById('quantity').value);
    const price = parseFloat(document.getElementById('price').value);
    const total = (quantity * price).toFixed(2);

    if (!date || !content || !orderNumber || isNaN(quantity) || isNaN(price)) {
        alert('Please fill in all fields.');
        return;
    }

    const tableBody = document.querySelector('#order-table tbody');
    const row = tableBody.insertRow();
    row.innerHTML = `
        <td>${date}</td>
        <td>${content}</td>
        <td>${orderNumber}</td>
        <td>${quantity.toFixed(2)}</td>
        <td>${price.toFixed(2)}</td>
        <td>${total}</td>
        <td>
            <button class="edit-row">Edit</button>
            <button class="delete-row">Delete</button>
        </td>
    `;

    updateGrandTotal();
    saveRecords();
    clearForm();
}

function updateGrandTotal() {
    const rows = document.querySelectorAll('#order-table tbody tr');
    let grandTotal = 0;
    rows.forEach(row => {
        const total = parseFloat(row.cells[5].innerText);
        grandTotal += total;
    });
    document.getElementById('grand-total').innerText = grandTotal.toFixed(2);
}

function clearForm() {
    document.getElementById('date').value = '';
    document.getElementById('content').value = '';
    document.getElementById('order-number').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('price').value = '';
}

function editRow(row) {
    const cells = row.cells;
    document.getElementById('date').value = cells[0].innerText;
    document.getElementById('content').value = cells[1].innerText;
    document.getElementById('order-number').value = cells[2].innerText;
    document.getElementById('quantity').value = parseFloat(cells[3].innerText);
    document.getElementById('price').value = parseFloat(cells[4].innerText);

    row.remove();
    updateGrandTotal();
    saveRecords();
}

function saveRecords() {
    const rows = document.querySelectorAll('#order-table tbody tr');
    const records = [];
    rows.forEach(row => {
        const cells = row.cells;
        const record = {
            date: cells[0].innerText,
            content: cells[1].innerText,
            orderNumber: cells[2].innerText,
            quantity: parseFloat(cells[3].innerText),
            price: parseFloat(cells[4].innerText),
            total: parseFloat(cells[5].innerText),
        };
        records.push(record);
    });
    localStorage.setItem('orderRecords', JSON.stringify(records));
}

function loadRecords() {
    const records = JSON.parse(localStorage.getItem('orderRecords')) || [];
    const tableBody = document.querySelector('#order-table tbody');
    records.forEach(record => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.content}</td>
            <td>${record.orderNumber}</td>
            <td>${record.quantity.toFixed(2)}</td>
            <td>${record.price.toFixed(2)}</td>
            <td>${record.total.toFixed(2)}</td>
            <td>
                <button class="edit-row">Edit</button>
                <button class="delete-row">Delete</button>
            </td>
        `;
    });
    updateGrandTotal();
}

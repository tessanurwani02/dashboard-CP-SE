let currentPage = 0;
let pageSize = 50;
let data = [];

// Fungsi untuk menampilkan data ke dalam tabel
function displayData(dataSlice) {
  const tableBody = document.getElementById("table-body");
  let html = "";

  dataSlice.forEach((item) => {
      html += `
          <tr>
            <td>${item.transaction_id}</td>
            <td>${item.transaction_date}</td>
            <td>${item.transaction_time}</td>
            <td>${item.transaction_qty}</td>
            <td>${item.store_id}</td>
            <td>${item.store_location}</td>
            <td>${item.product_id}</td>
            <td>${item.unit_price}</td>
            <td>${item.product_category}</td>
            <td>${item.product_type}</td>
            <td>${item.product_detail}</td>
          </tr>
      `;
  });

  tableBody.innerHTML = html;
}

// Fungsi untuk menghandle pagination
function paginate() {
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const dataSlice = data.slice(startIndex, endIndex);
  displayData(dataSlice);
}

// Fungsi untuk menghandle klik tombol next dan previous
function handlePaginationButtons() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  prevBtn.addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      paginate();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < Math.ceil(data.length / pageSize) - 1) {
      currentPage++;
      paginate();
    }
  });
}

// Fetch data dari file external
fetch('coffeeShopSalesData.json')
  .then(response => response.json())
  .then((fetchedData) => {
    data = fetchedData;
    paginate();
    handlePaginationButtons();
  });

const labels = [];
const dataValues = [];

// Menampilkan chart total transaksi all category
fetch('coffeeShopSalesData.json')
  .then(response => response.json())
  .then(data => {
    // Processing data
    const transactionsByCategory = data.reduce((acc, transaction) => {
      const category = transaction.product_category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.transaction_qty * 1; // convert to number
      return acc;
    }, {});

    // Sort data before pushing to arrays
    const sortedData = Object.values(transactionsByCategory).sort((a, b) => b - a);
    const sortedCategories = Object.keys(transactionsByCategory).sort((a, b) => {
      const indexA = Object.values(transactionsByCategory).indexOf(sortedData[Object.keys(transactionsByCategory).indexOf(a)]);
      const indexB = Object.values(transactionsByCategory).indexOf(sortedData[Object.keys(transactionsByCategory).indexOf(b)]);
      return indexA - indexB;
    });

    // Preparing data for chart
    for (const category of sortedCategories) {
      labels.push(category);
      dataValues.push(transactionsByCategory[category]);
    }

    // Creating chart
    const ctx = document.getElementById('myChart1').getContext('2d');
    const config = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Transactions',
          data: dataValues,
          backgroundColor: [
            'rgb(255, 199, 0)'
          ],
          borderColor: [
            'rgb(178, 139, 0)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 500
            },
            title: {
              display: true,
              text: 'Total Transaction'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Product Category'
            }
          }
        }
      }
    };
    new Chart(ctx, config);
  });

// Menampilkan chart total transaksi category packaged chocolate in each store
fetch('coffeeShopSalesData.json')
  .then(response => response.json())
  .then(data => {
    const packagedChocolateData = data.filter(item => item.product_category === 'Packaged Chocolate');
    const storeLocations = [...new Set(packagedChocolateData.map(item => item.store_location))];
    const chartData = storeLocations.map(storeLocation => {
      const transactions = packagedChocolateData.filter(item => item.store_location === storeLocation);
      const totalTransaction = transactions.reduce((acc, current) => acc + parseInt(current.transaction_qty), 0);
      return { label: storeLocation, value: totalTransaction };
    });

    const ctx = document.getElementById('myChart2').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartData.map(item => item.label),
        datasets: [{
          label: 'Total Transaction',
          data: chartData.map(item => item.value),
          backgroundColor: [
            'rgb(255, 199, 0)',
            'rgb(178, 139, 0)',
            'rgb(239, 236, 184)'
          ],
          borderColor: [
            'rgb(178, 139, 0)',
            'rgb(178, 139, 0)',
            'rgb(178, 139, 0)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        title: {
          display: true,
          text: 'Total Transaksi per Store Location'
        }
      }
    });
  })
  .catch(error => console.error(error));
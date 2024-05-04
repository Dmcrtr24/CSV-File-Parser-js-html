// Функция для загрузки CSV-файла
function loadCSV(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.responseText);
            } else {
                reject(new Error(`Error loading CSV file: ${xhr.statusText}`));
            }
        };
        xhr.onerror = () => {
            reject(new Error('Network error'));
        };
        xhr.send();
    });
}

// Функция для обработки CSV-данных
function processCSV(csvData) {
    const rows = csvData.trim().split('\n');
    const data = rows.map(row => row.split(',').map(value => value.trim()));
    return data.slice(1); // Удаляем заголовок
}

// Функция для поиска данных по npo_account_id и кварталу
function searchData(npo_account_id, quarter) {
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'block'; // Показываем индикатор загрузки
//путь к  CSV файлу
    return loadCSV('grid2test.csv')
        .then(processCSV)
        .then(data => {
            const filteredData = data.filter(row => {
                return (npo_account_id ? row[2] === npo_account_id : true) &&
                    (quarter ? row[1] === quarter : true);
            });

            if (filteredData.length === 0) {
                throw new Error('Данные не найдены');
            }

            return filteredData;
        })
        .catch(error => {
            console.error(error);
            throw error;
        })
        .finally(() => {
            loadingIndicator.style.display = 'none'; // Скрываем индикатор загрузки
        });
}

// Обработчик события отправки формы
const form = document.getElementById('search-form');
const resultDiv = document.getElementById('result');
const loadingIndicator = document.createElement('div');
loadingIndicator.id = 'loading-indicator';
loadingIndicator.textContent = 'Загрузка...';
loadingIndicator.style.display = 'none';
resultDiv.parentNode.insertBefore(loadingIndicator, resultDiv);

form.addEventListener('submit', e => {
    e.preventDefault();
    const npo_account_id = document.getElementById('npo_account_id').value;
    const quarter = document.getElementById('quarter').value;

    if (!npo_account_id && !quarter) {
        resultDiv.textContent = 'Введите NPO Account ID и квартал';
        return;
    }

    searchData(npo_account_id, quarter)
        .then(data => {
            if (npo_account_id && quarter) {
                const row = data[0];
resultDiv.textContent = `Вероятность для ${npo_account_id} в ${quarter}: ${parseInt(row[3])}`;
            } else {
                buildChart(data);
            }
        })
        .catch(error => {
            resultDiv.textContent = error.message;
        });
});
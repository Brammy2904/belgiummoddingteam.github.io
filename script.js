function addField(containerId) {
    const container = document.getElementById(containerId);
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'number-field';
    container.appendChild(input);
}

function generateConfig() {
    const form = document.getElementById('configForm');
    const formData = new FormData(form);

    const configData = {};
    const numberFields = ['blauw', 'directLinks', 'directRechts', 'directCenter', 'steadyWhite', 'steadyBlue', 'sf', 'pitje'];

    numberFields.forEach(field => {
        const fieldValues = formData.getAll(field).map(Number).filter(value => !isNaN(value));
        configData[field] = fieldValues;
    });

    configData['sirene'] = formData.get('siren');
    configData['Dualsirene'] = formData.get('dualsiren');

    if (configData['pitje'].length > 0) {
        configData['excludeSiren'] = ['pitje'];
    } else {
        configData['excludeSiren'] = [];
    }

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();

    URL.revokeObjectURL(url);
}

function uploadConfig() {
    const fileUpload = document.getElementById('fileUpload');
    fileUpload.click();

    fileUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            const configData = JSON.parse(e.target.result);
            populateForm(configData);
        };

        reader.readAsText(file);
    });
}

function populateForm(configData) {
    for (const key in configData) {
        const value = configData[key];
        if (Array.isArray(value)) {
            const containerId = key + 'Fields';
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            value.forEach(num => {
                const input = document.createElement('input');
                input.type = 'number';
                input.value = num;
                input.className = 'number-field';
                container.appendChild(input);
            });
        } else {
            const select = document.querySelector(`[name=${key}]`);
            if (select) select.value = value;
        }
    }
}

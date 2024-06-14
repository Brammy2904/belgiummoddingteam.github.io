document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('[data-tooltip]');
    elements.forEach(el => {
        el.addEventListener('mouseover', showTooltip);
        el.addEventListener('mouseout', hideTooltip);
    });
});

function showTooltip(event) {
    const tooltipText = event.target.getAttribute('data-tooltip');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerHTML = tooltipText;
    document.body.appendChild(tooltip);

    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = rect.left + window.pageXOffset + 'px';
    tooltip.style.top = rect.top + window.pageYOffset - tooltip.offsetHeight + 'px';

    event.target._tooltip = tooltip;
}

function hideTooltip(event) {
    const tooltip = event.target._tooltip;
    if (tooltip) {
        tooltip.remove();
        event.target._tooltip = null;
    }
}

function addField(containerId) {
    const container = document.getElementById(containerId);
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'number-field';
    input.name = containerId.replace("Fields", "");
    container.appendChild(input);
}

function generateConfig() {
    const form = document.getElementById('configForm');
    const formData = new FormData(form);

    const configData = {};
    const numberFields = ['blauw', 'directLinks', 'directRechts', 'directCenter', 'steadyWhite', 'steadyBlue', 'sf', 'pitje'];

    numberFields.forEach(field => {
        const fieldValues = formData.getAll(field).map(Number).filter(value => !isNaN(value)).filter(value => value > 0);
        if (fieldValues.length > 0) {
            configData[field] = fieldValues;
        }
    });

    configData['sirene'] = formData.get('siren');
    if(!formData.get('dualsiren') == "Geen") {
        configData['Dualsirene'] = formData.get('dualsiren')
    }
    if (configData['pitje'] && configData['pitje'].length > 0) {
        configData['excludeSiren'] = ['pitje'];
    }

    const spawnVoertuig = formData.get('spawnVoertuig');

    let fileContent = `
local configData = {}
local spawnVoertuig = \`${spawnVoertuig}\`
if type(spawnVoertuig) ~= 'number' then
    spawnVoertuigB = GetHashKey(spawnVoertuig)
    spawnVoertuig = spawnVoertuigB
end
configData[spawnVoertuig] = {
    ${Object.keys(configData).map(key => `${key} = ${JSON.stringify(configData[key]).replace("[", "{").replace("]", "}")}`).join(',\n    ')},
    unique = {
        directLinks = {},
        directRechts = {},
        directCenter = {},
    }
}
AddEventHandler('onClientResourceStart', function(resourceName)
    if (GetCurrentResourceName() == resourceName) then
        local respons = TriggerEvent("controlPanelV2:retrieveConfigs", configData, spawnVoertuig)
        Wait(1000)
        while respons == nil do
            respons = TriggerEvent("controlPanelV2:retrieveConfigs", configData, spawnVoertuig)
        end
    end
end)`;

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${spawnVoertuig}.config.lua`;
    link.click();
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

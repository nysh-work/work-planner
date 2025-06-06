let auditData = [];
let filteredData = [];

async function loadAuditData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        auditData = await response.json();
        filteredData = [...auditData];
        // Initialize views after data is loaded
        renderTable();
        renderTimeline();
    } catch (error) {
        console.error("Could not load audit data:", error);
    }
}


function renderTable() {
    const tbody = document.getElementById('auditTableBody');
    tbody.innerHTML = '';
    
    filteredData.forEach(audit => {
        const row = document.createElement('tr');
        
        const managerClass = audit.manager.toLowerCase().includes('lilly') ? 'manager-lilly' : 
                          audit.manager.toLowerCase().includes('sharath') ? 'manager-sharath' : 'manager-albin';
        
        const timelineClass = audit.target.toLowerCase().includes('june') ? 'june' :
                            audit.target.toLowerCase().includes('july') ? 'july' :
                            audit.target.toLowerCase().includes('august') ? 'august' : 'na';
        
        console.log('Audit object:', audit);
        console.log('Audit client:', audit.client);

        row.innerHTML = `
            <td>
                <div class="client-name">${audit.client}</div>
            </td>
            <td>
                <span class="manager-tag ${managerClass}">${audit.manager}</span>
            </td>
            <td>
                <div class="resource-list">
                    ${audit.resource1 ? `<div class="resource-item">${audit.resource1}</div>` : ''}
                    ${audit.resource2 ? `<div class="resource-item">${audit.resource2}</div>` : ''}
                </div>
            </td>
            <td>
                <span class="timeline-tag ${timelineClass}">${audit.target}</span>
            </td>
            <td><span class="status-tag status-${audit.status.toLowerCase().replace(/\s+/g, '-')}">${audit.status}</span></td>
        `;
        
        tbody.appendChild(row);
    });
}

function renderTimeline() {
    const months = ['june', 'july', 'august'];
    
    months.forEach(month => {
        const container = document.getElementById(`${month}Timeline`);
        container.innerHTML = '';
        
        const monthData = filteredData.filter(audit => 
            audit.target.toLowerCase().includes(month)
        );
        
        const weeks = {};
        monthData.forEach(audit => {
            const weekMatch = audit.target.match(/Week (\d+)/);
            const week = weekMatch ? `Week ${weekMatch[1]}` : 'Other';
            
            if (!weeks[week]) weeks[week] = [];
            weeks[week].push(audit);
        });
        
        Object.keys(weeks).sort().forEach(week => {
            const weekGroup = document.createElement('div');
            weekGroup.className = 'week-group';
            
            weekGroup.innerHTML = `
                <div class="week-title">${week}</div>
                ${weeks[week].map(audit => `
                    <div class="audit-item">
                        <div class="audit-client">${audit.client}</div>
                        <div class="audit-details">
                            <span>Manager: ${audit.manager}</span>
                            <span>Resources: ${[audit.resource1, audit.resource2].filter(r => r).join(', ')}</span>
                        </div>
                    </div>
                `).join('')}
            `;
            
            container.appendChild(weekGroup);
        });
    });
}

function applyFilters() {
    const managerFilter = document.getElementById('managerFilter').value;
    const monthFilter = document.getElementById('monthFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
    
    filteredData = auditData.filter(audit => {
        const managerMatch = managerFilter === 'all' || audit.manager === managerFilter;
        const monthMatch = monthFilter === 'all' || audit.target.toLowerCase().includes(monthFilter);
        const searchMatch = searchFilter === '' || audit.client.toLowerCase().includes(searchFilter);
        
        return managerMatch && monthMatch && searchMatch;
    });
    
    renderTable();
    renderTimeline();
}

function switchView(view) {
    const tableView = document.getElementById('tableView');
    const timelineView = document.getElementById('timelineView');
    const buttons = document.querySelectorAll('.view-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (view === 'table') {
        tableView.style.display = 'block';
        timelineView.style.display = 'none';
        buttons[0].classList.add('active');
    } else {
        tableView.style.display = 'none';
        timelineView.style.display = 'block';
        buttons[1].classList.add('active');
    }
}

// Event listeners
document.getElementById('managerFilter').addEventListener('change', applyFilters);
document.getElementById('monthFilter').addEventListener('change', applyFilters);
document.getElementById('searchFilter').addEventListener('input', applyFilters);

// Initialize by loading data
loadAuditData();
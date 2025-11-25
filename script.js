document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const studentsInput = document.getElementById('students-input');
    const studentCountDisplay = document.getElementById('student-count');
    const modeBtns = document.querySelectorAll('.toggle-btn');
    const numberLabel = document.getElementById('number-label');
    const numberInput = document.getElementById('number-value');
    const generateBtn = document.getElementById('generate-btn');
    const errorMessage = document.getElementById('error-message');
    const resultsSection = document.getElementById('results-section');

    // State
    let currentMode = 'groups'; // 'groups' or 'size'

    // Event Listeners
    studentsInput.addEventListener('input', updateStudentCount);
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setMode(btn.dataset.mode);
        });
    });

    generateBtn.addEventListener('click', generateGroups);

    // Functions
    function updateStudentCount() {
        const students = getStudentList();
        studentCountDisplay.textContent = students.length;
    }

    function getStudentList() {
        const text = studentsInput.value.trim();
        if (!text) return [];
        return text.split(/\n/).map(s => s.trim()).filter(s => s.length > 0);
    }

    function setMode(mode) {
        currentMode = mode;
        
        // Update UI
        modeBtns.forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update Label
        if (mode === 'groups') {
            numberLabel.textContent = 'Nombre de grups';
        } else {
            numberLabel.textContent = 'Alumnes per grup';
        }
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    function generateGroups() {
        hideError();
        resultsSection.innerHTML = '';

        const students = getStudentList();
        const numberValue = parseInt(numberInput.value);

        // Validation
        if (students.length === 0) {
            showError('Si us plau, introdueix almenys un alumne.');
            return;
        }

        if (isNaN(numberValue) || numberValue < 1) {
            showError('Si us plau, introdueix un número vàlid.');
            return;
        }

        let groups = [];

        if (currentMode === 'groups') {
            // Mode: Number of Groups
            if (numberValue > students.length) {
                showError('No pots crear més grups que alumnes.');
                return;
            }
            if (numberValue === students.length) {
                 showError('Els grups no poden ser individuals (1 alumne per grup).');
                 return;
            }

            groups = distributeByGroups(students, numberValue);

        } else {
            // Mode: Students per Group
            if (numberValue >= students.length && students.length > 1) {
                 // If we want groups of size N where N >= total students, that's just 1 group.
                 // But if N == 1, that's individual groups.
            }
            
            if (numberValue === 1) {
                showError('Els grups no poden ser individuals.');
                return;
            }
            
            if (numberValue > students.length) {
                 showError(`No pots fer grups de ${numberValue} amb només ${students.length} alumnes.`);
                 return;
            }

            groups = distributeBySize(students, numberValue);
        }

        if (groups.length === 0) {
             showError('No s\'han pogut generar els grups.');
             return;
        }

        renderGroups(groups);
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function distributeByGroups(students, numGroups) {
        const shuffled = shuffle([...students]);
        const groups = Array.from({ length: numGroups }, () => []);
        
        shuffled.forEach((student, index) => {
            const groupIndex = index % numGroups;
            groups[groupIndex].push(student);
        });

        return groups;
    }

    function distributeBySize(students, size) {
        const shuffled = shuffle([...students]);
        const groups = [];
        
        // Calculate number of groups needed
        // We want to fill groups as much as possible, but distribute remainders if needed?
        // Usually "students per group" means chunks of size N. The last group might be smaller.
        // OR we try to make them all approximately size N.
        // Let's go with chunks of size N, and if the last one is too small (like 1 person), maybe merge?
        // Requirement: "Groups never individual".
        
        // Simple chunking first
        for (let i = 0; i < shuffled.length; i += size) {
            groups.push(shuffled.slice(i, i + size));
        }

        // Check last group
        if (groups.length > 1) {
            const lastGroup = groups[groups.length - 1];
            if (lastGroup.length === 1) {
                // If last group has only 1 person, distribute them to the previous group
                // OR redistribute. 
                // Let's move the single person to the first group for simplicity, or previous.
                const loneStudent = lastGroup[0];
                groups.pop(); // Remove last group
                groups[groups.length - 1].push(loneStudent);
            }
        }

        return groups;
    }

    function renderGroups(groups) {
        groups.forEach((group, index) => {
            const card = document.createElement('div');
            card.className = 'group-card';
            card.style.animationDelay = `${index * 0.1}s`;

            const header = document.createElement('div');
            header.className = 'group-header';
            header.innerHTML = `
                <span>Grup ${index + 1}</span>
                <span class="group-count">${group.length}</span>
            `;

            const list = document.createElement('ul');
            list.className = 'group-list';
            
            group.forEach(student => {
                const li = document.createElement('li');
                li.textContent = student;
                list.appendChild(li);
            });

            card.appendChild(header);
            card.appendChild(list);
            resultsSection.appendChild(card);
        });
    }
});

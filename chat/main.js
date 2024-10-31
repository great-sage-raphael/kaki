const button1 = document.querySelector("#button1");

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

button1.addEventListener('click', processFiles);

async function processFiles() {
    const inputFile = document.querySelector("#inputFile").files[0];
    const optabFile = document.querySelector("#optabFile").files[0];

    if (!inputFile || !optabFile) {
        document.querySelector("#symbolTable").textContent = "Error processing the files...";
        document.querySelector("#machineCode").textContent = "Error processing the files...";
        return;
    }

    try {
        const inputContent = await readFile(inputFile);
        const optabContent = await readFile(optabFile);

        const { symbolTable, machineCode } = pass1andpass2(inputContent, optabContent);

        document.querySelector("#symbolTable").textContent = symbolTable;
        document.querySelector("#machineCode").textContent = machineCode;

    } catch (err) {
        console.error(err);
        document.querySelector("#symbolTable").textContent = "Error loading the files...";
        document.querySelector("#machineCode").textContent = "Error loading the files...";
    }
}

function pass1andpass2(inputContent, optabContent) {
    const optab = {};
    optabContent.split('\n').forEach(line => {
        const [mnemonic, opcode] = line.trim().split(/\s+/);
        if (opcode && mnemonic) {
            optab[mnemonic] = opcode;
        }
    });

    const lines = inputContent.split('\n');
    const symtab = {};
    let locationCounter = 0;
    let intermediateCode = [];
    let startAddress = null;

    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length === 3) {
            const [label, instruction, operand] = parts;

            if (instruction === 'START') {
                startAddress = parseInt(operand, 16);
                locationCounter = startAddress; 
            } else {
                if (label !== '-') {
                    symtab[label] = locationCounter.toString(16).toUpperCase();
                }
                intermediateCode.push({ address: locationCounter.toString(16).toUpperCase(), instruction, operand });

                if (optab[instruction]) {
                    locationCounter += 3; 
                } else if (instruction === 'BYTE') {
                    locationCounter += operand.length - 3; 
                } else if (instruction === 'WORD') {
                    locationCounter += 3;
                } else if (instruction === 'RESB') {
                    locationCounter += parseInt(operand);
                } else if (instruction === 'RESW') {
                    locationCounter += 3 * parseInt(operand);
                }
            }
        }
    });

    let symbolTable = 'Symbol Table:\n';
    for (const [label, address] of Object.entries(symtab)) {
        symbolTable += `${label}: ${address}\n`;
    }

    let machineCode = 'Machine Code:\n';
    intermediateCode.forEach(line => {
        const { address, instruction, operand } = line;
        let opcode = optab[instruction] || '';
        let operandAddress = symtab[operand] || operand || '';

        if (instruction === 'BYTE') {
            const byteValue = operand.slice(2, -1); 
            machineCode += `${address} ${byteValue}\n`;
        } else if (instruction === 'WORD') {
            const wordValue = parseInt(operand, 10).toString(16).padStart(6, '0').toUpperCase();
            machineCode += `${address} ${wordValue}\n`;
        } else if (opcode) {
            machineCode += `${address} ${opcode} ${operandAddress}\n`;
        }
    });

    return { symbolTable, machineCode };
}
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
        document.querySelector("#output").textContent = "Error processing the files...";
        return;
    }

    try {
        // Read the files
        const inputContent = await readFile(inputFile);
        const optabContent = await readFile(optabFile);

        // Execute Pass 1 and Pass 2
        const output = pass1andpass2(inputContent, optabContent);

        // Display the output
        document.querySelector("#output").textContent = output;

    } catch (err) {
        console.error(err);
        document.querySelector("#output").textContent = "Error loading the files...";
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
    let startAddress = null;
    let intermediateCode = [];

    // Pass 1: Build symbol table and calculate addresses
    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length === 3) {
            const [label, instruction, operand] = parts;

            // Handle the START directive
            if (instruction === 'START') {
                startAddress = parseInt(operand, 16);
                locationCounter = startAddress; // Initialize location counter to starting address
            } else {
                if (label !== '-') {
                    symtab[label] = locationCounter.toString(16).toUpperCase();
                }
                intermediateCode.push({ address: locationCounter.toString(16).toUpperCase(), instruction, operand });

                // Calculate location counter
                if (optab[instruction]) {
                    locationCounter += 3; // Most instructions are 3 bytes long
                } else if (instruction === 'BYTE') {
                    locationCounter += operand.length - 3; // Adjust for the length of the byte
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

    // Pass 2: Generate machine code
    let objectCodeArr = [];
    let output = '';
    let header = `H^${lines[0].split(/\s+/)[0].padEnd(6, '_')}^${startAddress.toString(16).toUpperCase().padStart(4, '0')}^${(locationCounter - startAddress).toString(16).padStart(6, '0')}`;
    
    objectCodeArr.push(header); // Add header to object code

    intermediateCode.forEach(line => {
        const { address, instruction, operand } = line;
        let opcode = optab[instruction] || '';
        let operandAddress = symtab[operand] || operand || '';

        let objectCode = '';
        if (instruction === 'BYTE') {
            const byteValue = operand.slice(2, -1).split('').map(char => char.charCodeAt(0).toString(16)).join('');
            objectCode = byteValue;
        } else if (instruction === 'WORD') {
            const wordValue = parseInt(operand).toString(16).padStart(6, '0').toUpperCase();
            objectCode = wordValue;
        } else if (opcode) {
            objectCode = opcode + operandAddress; // Opcode + address
        }

        if (objectCode) {
            objectCodeArr.push(objectCode);
        }
    });

    // Create text records
    let textRecord = 'T^';
    let recordAddress = startAddress.toString(16).toUpperCase();
    let recordLength = 0;
    let recordData = '';

    objectCodeArr.forEach((code, index) => {
        if (recordLength + code.length / 2 > 30) { // Maximum length of 30 characters in text record
            textRecord += `${recordAddress}^${(recordLength / 2).toString(16).padStart(2, '0')}` + recordData + '\n';
            recordAddress = (parseInt(recordAddress, 16) + recordLength / 2).toString(16).toUpperCase();
            recordLength = 0;
            recordData = '';
        }
        recordData += code;
        recordLength += code.length;
    });

    // Add remaining data to text record
    if (recordData) {
        textRecord += `${recordAddress}^${(recordLength / 2).toString(16).padStart(2, '0')}` + recordData + '\n';
    }

    // End record
    const endRecord = `E^${startAddress.toString(16).toUpperCase()}`;
    
    // Combine all parts
    output = objectCodeArr.join('\n') + '\n' + textRecord + endRecord;

    return output;
}

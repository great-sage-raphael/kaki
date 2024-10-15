// Symbol Table (Pass 1)
let symbolTable = {};

// Memory to store variable values
let memory = {};
//placeholder="enter your assembly code here---"
// Opcodes for instruction set
const opcodes = {
    'LDA': '01',   // Load Accumulator
    'ADD': '02',   // Add to Accumulator
    'STA': '03',   // Store Accumulator
    'HLT': 'FF',   // Halt
    'DB': ''       // Define Byte (handled as data)
};
// read the file from button
const fileinput=document.querySelector("textarea1")
const button1 = document.querySelector("#button1");
button1.addEventListener(click,(e)=>{
    const file=fileinput.files[0];
    if(file){
        const reader =new FileReader();
        reader.onload=function(e){
            const filecontent=e.target.result;
        }
    }

});
// Function to process assembly code
function processAssemblyCode(assemblyCode) {
    symbolTable = {};
    memory = {};

    // Run Pass 1 and Pass 2
    pass1(assemblyCode);
    pass2(assemblyCode);

    // Output the results to the HTML page
    document.getElementById('output').innerText = `Symbol Table (Pass 1):\n${JSON.stringify(symbolTable, null, 2)}\n\nMemory:\n${JSON.stringify(memory, null, 2)}`;
}

// Pass 1: Build symbol table
function pass1(assemblyCode) {
    let address = 0;
    const lines = assemblyCode.split('\n');

    lines.forEach((line) => {
        let cleanLine = line.trim();
        if (cleanLine) {
            // Split label and instruction
            const parts = cleanLine.split(/\s+/);
            if (parts[0].endsWith(':')) {
                const label = parts[0].slice(0, -1);
                symbolTable[label] = address;
            }
            
            // Check if it's an instruction (not DB)
            if (opcodes[parts[1]] !== undefined) {
                address += 1;
            } else if (parts[1] === 'DB') {
                address += 1;
            }
        }
    });

    console.log("Symbol Table (Pass 1):", symbolTable);
}

// Pass 2: Generate machine code
function pass2(assemblyCode) {
    let machineCode = [];
    const lines = assemblyCode.split('\n');

    lines.forEach((line) => {
        let cleanLine = line.trim();
        if (cleanLine) {
            const parts = cleanLine.split(/\s+/);
            if (opcodes[parts[0]] !== undefined) {  // If it's an instruction
                machineCode.push(opcodes[parts[0]]);
                if (symbolTable[parts[1]]) {
                    machineCode.push(symbolTable[parts[1]].toString(16).padStart(2, '0'));
                }
            } else if (parts[1] === 'DB') {  // Handle data
                memory[parts[0].slice(0, -1)] = parseInt(parts[2], 10);
            }
        }
    });

    console.log("Machine Code (Pass 2):", machineCode.join(' '));
    console.log("Memory:", memory);

    // Append machine code to the output
    const outputElem = document.getElementById('output');
    outputElem.innerText += `\n\nMachine Code (Pass 2):\n${machineCode.join(' ')}`;
}

// Function to read the file
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const assemblyCode = e.target.result;
            processAssemblyCode(assemblyCode);
        };
        reader.readAsText(file);
    }
}

// Add event listener to the file input
document.getElementById('fileInput').addEventListener('change', handleFileSelect);

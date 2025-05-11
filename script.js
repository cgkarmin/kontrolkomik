// script.js - 11 Mei 2025, 06:35 AM WIB
document.addEventListener('DOMContentLoaded', () => {
    const actualFileUploadBtn = document.getElementById('uploadJson');
    const customFileUploadLabel = document.querySelector('.custom-file-upload');
    const customFileText = customFileUploadLabel ? customFileUploadLabel.querySelector('p') : null;
    
    const editorDiv = document.getElementById('editor');
    const editorPlaceholder = document.getElementById('editorPlaceholder');
    const editorAreaBody = document.getElementById('editorAreaBody'); 

    const btnToggleAuto = document.getElementById('btnToggleAuto');
    const autoSalinStatusSpan = document.getElementById('autoSalinStatus');

    let comicData = null; 
    let autoSalinAktif = true; 

    function initializeApp() {
        const currentYearSpan = document.getElementById("currentYear");
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }

        if (customFileUploadLabel && actualFileUploadBtn) {
            customFileUploadLabel.addEventListener('click', () => actualFileUploadBtn.click());
            actualFileUploadBtn.addEventListener('change', handleFileUploadEvent);
            initializeDragAndDrop(customFileUploadLabel, actualFileUploadBtn); 
        }
        updateToggleAutoButtonVisuals(); // Panggil untuk set gaya awal butang toggle

        if (editorAreaBody && !document.getElementById('tambahPanelUtamaBtn')) {
            const tambahPanelBtn = document.createElement('button');
            tambahPanelBtn.id = 'tambahPanelUtamaBtn';
            tambahPanelBtn.innerHTML = '<i class="bi bi-plus-square-dotted"></i> Tambah Panel Utama Baru';
            tambahPanelBtn.className = 'btn btn-outline-primary mt-3 w-100'; 
            tambahPanelBtn.addEventListener('click', tambahPanelUtamaBaru);
            
            if(editorDiv.nextSibling) { // Letak selepas div#editor jika ada elemen lain
                editorAreaBody.insertBefore(tambahPanelBtn, editorDiv.nextSibling);
            } else { // Jika tidak, letak di akhir card-body
                editorAreaBody.appendChild(tambahPanelBtn); 
            }
        }
    }

    function initializeDragAndDrop(dropArea, fileInput) {
        if (!dropArea || !fileInput) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false); 
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight-drag'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight-drag'), false);
        });

        dropArea.addEventListener('drop', (event) => {
            const dt = event.dataTransfer;
            const files = dt.files;

            if (files && files.length > 0) {
                fileInput.files = files;
                const changeEvent = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(changeEvent);
            }
        }, false);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleFileUploadEvent(event) { 
        const file = event.target.files[0];
        processFile(file); 
    }

    function processFile(file) { 
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsedData = JSON.parse(e.target.result);
                    if (!Array.isArray(parsedData)) {
                        throw new Error("Format JSON tidak sah: Data akar sepatutnya adalah sebuah array.");
                    }
                    parsedData.forEach((item, index) => {
                        if (typeof item !== 'object' || item === null || !item.subpanel || !Array.isArray(item.subpanel) || item.subpanel.length === 0) {
                            throw new Error(`Format JSON tidak sah pada Panel Utama ${index + 1}: Kunci 'subpanel' mesti ada, berupa array, dan tidak kosong.`);
                        }
                        if (typeof item.subpanel[0] !== 'object' || item.subpanel[0] === null) {
                             throw new Error(`Format JSON tidak sah pada Panel Utama ${index + 1}: subpanel[0] mesti berupa objek.`);
                        }
                    });

                   comicData = parsedData;
                   renderEditor();
                   if (editorPlaceholder) editorPlaceholder.style.display = 'none';
                   if (customFileText) customFileText.textContent = file.name; 
                   showAlert("Fail JSON berjaya diproses.", "success");
               } catch (error) {
                   console.error("Ralat semasa memproses JSON:", error);
                   showAlert(`Ralat memproses JSON: ${error.message}`, "danger");
                   comicData = null;
                   editorDiv.innerHTML = '';
                   if (editorPlaceholder) editorPlaceholder.style.display = 'block';
                   if (customFileText) customFileText.textContent = 'Klik atau Seret Fail JSON ke Sini';
                   if(actualFileUploadBtn) actualFileUploadBtn.value = ""; 
               }
            };
            reader.onerror = () => {
                showAlert("Ralat semasa membaca fail.", "danger");
                if (customFileText) customFileText.textContent = 'Klik atau Seret Fail JSON ke Sini';
                if(actualFileUploadBtn) actualFileUploadBtn.value = "";
            };
            reader.readAsText(file);
        } else if (file) {
            showAlert("Sila muat naik fail .json sahaja.", "warning");
            if(actualFileUploadBtn) actualFileUploadBtn.value = ""; 
            if (customFileText) customFileText.textContent = 'Klik atau Seret Fail JSON ke Sini';
        }
    }

    function renderEditor() {
        if (!comicData || comicData.length === 0) {
            editorDiv.innerHTML = '<p class="text-muted">Tiada data komik untuk dipaparkan atau format tidak dikenali.</p>';
            if (editorPlaceholder) editorPlaceholder.style.display = 'block';
            return;
        }
        editorDiv.innerHTML = '';
        if (editorPlaceholder) editorPlaceholder.style.display = 'none';

        comicData.forEach((panelUtama, panelUtamaIndex) => {
            const subPanel = panelUtama.subpanel[0]; 
            if (!subPanel) { 
                console.error(`Panel Utama ${panelUtamaIndex + 1} tidak mempunyai subpanel[0]. Melangkau.`);
                return; 
            }
            if (typeof subPanel.penampilan !== 'object' || subPanel.penampilan === null) {
                subPanel.penampilan = {}; 
            }

            const panelDiv = document.createElement('div');
            panelDiv.className = 'card mb-4 panel-editor-item'; 
            panelDiv.setAttribute('data-panel-utama-index', panelUtamaIndex);
            
            panelDiv.innerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <strong class="h5">Panel Utama ${panelUtamaIndex + 1}</strong>
                    <button class="btn btn-sm btn-outline-danger remove-panel-utama-btn" data-panel-utama-index="${panelUtamaIndex}">
                        <i class="bi bi-trash3-fill"></i> Padam Panel Ini
                    </button>
                </div>
                <div class="card-body">
                    <div class="row align-items-end"> 
                        <div class="col-md-8 mb-3"> 
                            <label for="watak-${panelUtamaIndex}-0" class="form-label fw-bold">Watak:</label>
                            <input type="text" id="watak-${panelUtamaIndex}-0" class="form-control dialogue-char-input" 
                                   value="${subPanel.watak || ''}" data-property="watak" 
                                   data-panel-utama-index="${panelUtamaIndex}" data-subpanel-index="0">
                        </div>
                        <div class="col-md-4 mb-3"> 
                            <button class="btn btn-outline-primary btn-sm w-100 copy-this-character-data-btn" 
                                    data-panel-utama-index="${panelUtamaIndex}" 
                                    title="Salin semua data watak ini (aksi, dialog, penampilan) ke panel lain dengan watak yang sama">
                                <i class="bi bi-person-lines-fill"></i> Salin Data Watak Ini
                            </button>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12 mb-3"> 
                             <label for="sudut-${panelUtamaIndex}-0" class="form-label fw-bold">Sudut Pandang Kamera:</label>
                             <input type="text" id="sudut-${panelUtamaIndex}-0" class="form-control" 
                                   value="${subPanel.sudut || ''}" data-property="sudut" 
                                   data-panel-utama-index="${panelUtamaIndex}" data-subpanel-index="0">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="aksi-${panelUtamaIndex}-0" class="form-label fw-bold">Aksi:</label>
                        <textarea id="aksi-${panelUtamaIndex}-0" class="form-control" rows="2" 
                                  data-property="aksi" data-panel-utama-index="${panelUtamaIndex}" 
                                  data-subpanel-index="0">${subPanel.aksi || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label for="dialog-${panelUtamaIndex}-0" class="form-label fw-bold">Dialog:</label>
                        <textarea id="dialog-${panelUtamaIndex}-0" class="form-control dialogue-text-input" rows="2" 
                                  data-property="dialog" data-panel-utama-index="${panelUtamaIndex}" 
                                  data-subpanel-index="0">${subPanel.dialog || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label for="gaya-${panelUtamaIndex}-0" class="form-label fw-bold">Gaya Visual:</label>
                        <input type="text" id="gaya-${panelUtamaIndex}-0" class="form-control" 
                               value="${subPanel.gaya || ''}" data-property="gaya" 
                               data-panel-utama-index="${panelUtamaIndex}" data-subpanel-index="0">
                    </div>

                    <fieldset class="border p-3 mt-4 rounded">
                        <legend class="w-auto px-2 h6 fw-bold text-primary">Detail Penampilan Watak</legend>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="penampilan-warna_pakaian-${panelUtamaIndex}-0" class="form-label">Warna Pakaian:</label>
                                <input type="text" id="penampilan-warna_pakaian-${panelUtamaIndex}-0" class="form-control" 
                                       value="${subPanel.penampilan.warna_pakaian || ''}" data-penampilan-property="warna_pakaian" 
                                       data-panel-utama-index="${panelUtamaIndex}" data-subpanel-index="0">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="penampilan-jenis_pakaian-${panelUtamaIndex}-0" class="form-label">Jenis Pakaian:</label>
                                <input type="text" id="penampilan-jenis_pakaian-${panelUtamaIndex}-0" class="form-control" 
                                       value="${subPanel.penampilan.jenis_pakaian || ''}" data-penampilan-property="jenis_pakaian" 
                                       data-panel-utama-index="${panelUtamaIndex}" data-subpanel-index="0">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="penampilan-aksesori-${panelUtamaIndex}-0" class="form-label">Aksesori:</label>
                                <input type="text" id="penampilan-aksesori-${panelUtamaIndex}-0" class="form-control" 
                                       value="${subPanel.penampilan.aksesori || ''}" data-penampilan-property="aksesori" 
                                       data-panel-utama-index="${panelUtamaIndex}" data-subpanel-index="0">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="penampilan-ekspresi_wajah-${panelUtamaIndex}-0" class="form-label">Ekspresi Wajah:</label>
                                <input type="text" id="penampilan-ekspresi_wajah-${panelUtamaIndex}-0" class="form-control" 
                                       value="${subPanel.penampilan.ekspresi_wajah || ''}" data-penampilan-property="ekspresi_wajah" 
                                       data-panel-utama-index="${panelUtamaIndex}" data-subpanel-index="0">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="penampilan-warna_kulit-${panelUtamaIndex}-0" class="form-label">Warna Kulit:</label>
                                <input type="text" id="penampilan-warna_kulit-${panelUtamaIndex}-0" class="form-control" 
                                       value="${subPanel.penampilan.warna_kulit || ''}" data-penampilan-property="warna_kulit" 
                                       data-panel-utama-index="${panelUtamaIndex}" data-subpanel-index="0">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="penampilan-gaya_rambut-${panelUtamaIndex}-0" class="form-label">Gaya Rambut:</label>
                                <input type="text" id="penampilan-gaya_rambut-${panelUtamaIndex}-0" class="form-control" 
                                       value="${subPanel.penampilan.gaya_rambut || ''}" data-penampilan-property="gaya_rambut" 
                                       data-panel-utama-index="${panelUtamaIndex}" data-subpanel-index="0">
                            </div>
                        </div>
                    </fieldset>
                </div>
            `;
            editorDiv.appendChild(panelDiv);
        });

        document.querySelectorAll('.panel-editor-item input, .panel-editor-item textarea').forEach(input => {
            input.addEventListener('input', handleFieldInput);
            if (input.classList.contains('dialogue-text-input') || input.classList.contains('dialogue-char-input')) {
                input.addEventListener('input', handleAutoSalinLogic);
            }
        });
        
        document.querySelectorAll('.remove-panel-utama-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const panelUtamaIndexToRemove = parseInt(event.currentTarget.dataset.panelUtamaIndex);
                if (!isNaN(panelUtamaIndexToRemove) && comicData && panelUtamaIndexToRemove < comicData.length) {
                    comicData.splice(panelUtamaIndexToRemove, 1);
                    renderEditor();
                    showAlert("Panel Utama telah dipadam.", "info");
                }
            });
        });

        document.querySelectorAll('.copy-this-character-data-btn').forEach(button => {
            button.addEventListener('click', handleCopyThisCharacterData);
        });
    }
    
    function handleFieldInput(event) {
        if (!comicData) return;
        const target = event.target;
        const panelUtamaIndex = parseInt(target.dataset.panelUtamaIndex);
        const subPanelIndex = 0; 
        const property = target.dataset.property;
        const penampilanProperty = target.dataset.penampilanProperty;

        if (isNaN(panelUtamaIndex) || !comicData[panelUtamaIndex] || !comicData[panelUtamaIndex].subpanel || !comicData[panelUtamaIndex].subpanel[subPanelIndex]) {
            console.error("Indeks panel tidak sah atau data tidak wujud untuk dikemas kini.", target.dataset);
            return;
        }
        
        const subPanelToUpdate = comicData[panelUtamaIndex].subpanel[subPanelIndex];

        if (penampilanProperty) {
            if (!subPanelToUpdate.penampilan) { 
                subPanelToUpdate.penampilan = {};
            }
            subPanelToUpdate.penampilan[penampilanProperty] = target.value;
        } else if (property) {
            subPanelToUpdate[property] = target.value;
        }
    }

    function handleAutoSalinLogic(event) {
        if (!autoSalinAktif || !comicData) return;

        const currentInput = event.target;
        const panelUtamaIndexChanged = parseInt(currentInput.dataset.panelUtamaIndex);
        const subPanelIndexChanged = 0; 
        
        if (isNaN(panelUtamaIndexChanged) || !comicData[panelUtamaIndexChanged] || !comicData[panelUtamaIndexChanged].subpanel[subPanelIndexChanged]) return;

        const changedSubPanel = comicData[panelUtamaIndexChanged].subpanel[subPanelIndexChanged];
        const currentCharacter = changedSubPanel.watak; 
        
        if (!currentCharacter) return;

        const currentDialogueValue = changedSubPanel.dialog; 

        comicData.forEach((panelUtama, puIndex) => {
            if (!panelUtama.subpanel || !panelUtama.subpanel[0]) return; 
            const subP = panelUtama.subpanel[0]; 
            if (puIndex !== panelUtamaIndexChanged && subP.watak === currentCharacter) {
                const dialogueInputToUpdate = editorDiv.querySelector(`#dialog-${puIndex}-0`);
                if (dialogueInputToUpdate && dialogueInputToUpdate.value !== currentDialogueValue) {
                    dialogueInputToUpdate.value = currentDialogueValue; 
                    subP.dialog = currentDialogueValue; 
                }
            }
        });
    }
    
    function handleCopyThisCharacterData(event) {
        event.preventDefault();
        if (!comicData) {
            showAlert("Tiada data komik untuk diproses.", "warning");
            return;
        }

        const panelUtamaIndex = parseInt(event.currentTarget.dataset.panelUtamaIndex);
        if (isNaN(panelUtamaIndex) || !comicData[panelUtamaIndex] || !comicData[panelUtamaIndex].subpanel || !comicData[panelUtamaIndex].subpanel[0]) {
            showAlert("Panel sumber tidak sah.", "danger");
            return;
        }

        const sourceSubPanel = comicData[panelUtamaIndex].subpanel[0];
        const sourceWatak = sourceSubPanel.watak;

        if (!sourceWatak || sourceWatak.trim() === "") {
            showAlert("Sila masukkan nama watak pada panel sumber ini dahulu sebelum menyalin.", "warning");
            return;
        }

        let panelsUpdatedCount = 0;
        comicData.forEach((targetPanelUtama, targetIndex) => {
            if (targetIndex === panelUtamaIndex) return; 

            if (targetPanelUtama.subpanel && targetPanelUtama.subpanel[0] && targetPanelUtama.subpanel[0].watak === sourceWatak) {
                const targetSubPanel = targetPanelUtama.subpanel[0];
                
                targetSubPanel.aksi = sourceSubPanel.aksi || "";
                targetSubPanel.dialog = sourceSubPanel.dialog || ""; 
                targetSubPanel.sudut = sourceSubPanel.sudut || "";
                targetSubPanel.gaya = sourceSubPanel.gaya || "";
                targetSubPanel.penampilan = JSON.parse(JSON.stringify(sourceSubPanel.penampilan || {}));
                
                panelsUpdatedCount++;
            }
        });

        if (panelsUpdatedCount > 0) {
            renderEditor(); 
            showAlert(`Data untuk watak '${sourceWatak}' dari Panel Utama ${panelUtamaIndex + 1} telah disalin ke ${panelsUpdatedCount} panel lain.`, "success");
        } else {
            showAlert(`Tiada panel lain (selain panel sumber) ditemui dengan watak '${sourceWatak}'. Tiada apa yang disalin.`, "info");
        }
    }

    function updateToggleAutoButtonVisuals() {
        if (autoSalinAktif) {
            if (autoSalinStatusSpan) autoSalinStatusSpan.textContent = "Hidup";
            if (btnToggleAuto) {
                btnToggleAuto.classList.remove('btn-danger', 'text-white', 'inactive');
                btnToggleAuto.classList.add('btn-warning', 'text-dark', 'active');
            }
        } else {
            if (autoSalinStatusSpan) autoSalinStatusSpan.textContent = "Mati";
            if (btnToggleAuto) {
                btnToggleAuto.classList.remove('btn-warning', 'text-dark', 'active');
                btnToggleAuto.classList.add('btn-danger', 'text-white', 'inactive');
            }
        }
    }

    window.toggleAutoSalin = () => {
        if (!comicData) {
            showAlert("Sila muat naik fail JSON dahulu.", "warning");
            return;
        }
        autoSalinAktif = !autoSalinAktif;
        updateToggleAutoButtonVisuals();
        showAlert(`Auto Salin Dialog (Watak Sama) kini ${autoSalinAktif ? 'HIDUP' : 'MATI'}.`, "info");
    };

    window.salinKeSemua = () => {
        if (!comicData || comicData.length === 0 || !comicData[0].subpanel || comicData[0].subpanel.length === 0) {
            showAlert("Tiada data untuk disalin. Sila muat naik fail JSON.", "warning");
            return;
        }
        const sourceSubPanelData = JSON.parse(JSON.stringify(comicData[0].subpanel[0])); 

        comicData.forEach((panelUtama) => { 
            if (!panelUtama.subpanel) panelUtama.subpanel = [{}]; 
            panelUtama.subpanel[0] = JSON.parse(JSON.stringify(sourceSubPanelData)); 
        });
        renderEditor();
        showAlert("Data dari subpanel pertama (Panel Utama 1) telah disalin ke semua subpanel lain.", "success");
    };

    window.salinKeNamaSama = () => { 
        if (!comicData || comicData.length === 0) {
            showAlert("Tiada data untuk diproses. Sila muat naik fail JSON.", "warning");
            return;
        }
        const characterFirstOccurrence = {}; 

        comicData.forEach(panelUtama => {
            if (!panelUtama.subpanel || !panelUtama.subpanel[0]) return;
            const subP = panelUtama.subpanel[0];
            if (subP.watak && !(subP.watak in characterFirstOccurrence)) {
                characterFirstOccurrence[subP.watak] = JSON.parse(JSON.stringify(subP)); 
            }
        });

        comicData.forEach(panelUtama => {
            if (!panelUtama.subpanel || !panelUtama.subpanel[0]) return;
            const subP = panelUtama.subpanel[0];
            if (subP.watak && characterFirstOccurrence[subP.watak]) {
                const sourceData = characterFirstOccurrence[subP.watak];
                Object.keys(sourceData).forEach(key => {
                    subP[key] = JSON.parse(JSON.stringify(sourceData[key]));
                });
            }
        });
        renderEditor();
        showAlert("Data subpanel telah diselaraskan berdasarkan kemunculan pertama setiap watak.", "success");
    };

    window.padamSemua = () => { 
        if (!comicData || comicData.length === 0) {
            showAlert("Tiada data untuk dikosongkan.", "warning");
            return;
        }
        if (confirm("Anda pasti mahu mengosongkan semua medan dalam semua subpanel?")) {
            comicData.forEach(panelUtama => {
                if (!panelUtama.subpanel || !panelUtama.subpanel[0]) return;
                const subP = panelUtama.subpanel[0];
                subP.watak = "";
                subP.aksi = "";
                subP.dialog = "";
                subP.sudut = "";
                subP.gaya = "";
                if (subP.penampilan) { 
                    Object.keys(subP.penampilan).forEach(key => subP.penampilan[key] = "");
                } else {
                    subP.penampilan = { warna_pakaian: "", jenis_pakaian: "", aksesori: "", ekspresi_wajah: "", warna_kulit: "", gaya_rambut: "" }; 
                }
            });
            renderEditor();
            showAlert("Semua medan dalam subpanel telah dikosongkan.", "success");
        }
    };
    
    function tambahPanelUtamaBaru() {
        if (!comicData) { 
            comicData = [];
        }
        const newPanelUtama = {
            "subpanel": [
                {
                    "watak": "",
                    "aksi": "",
                    "dialog": "",
                    "sudut": "",
                    "gaya": "",
                    "penampilan": {
                        "warna_pakaian": "",
                        "jenis_pakaian": "",
                        "aksesori": "",
                        "ekspresi_wajah": "",
                        "warna_kulit": "",
                        "gaya_rambut": ""
                    }
                }
            ]
        };
        comicData.push(newPanelUtama);
        renderEditor();
        showAlert("Panel Utama baru telah ditambah.", "info");
        const newPanelElement = editorDiv.querySelector(`.panel-editor-item[data-panel-utama-index="${comicData.length - 1}"]`);
        if (newPanelElement) {
            newPanelElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }

    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    window.downloadJSON = () => {
        if (!comicData) {
            showAlert("Tiada data untuk dimuat turun.", "warning");
            return;
        }
        const jsonData = JSON.stringify(comicData, null, 2);
        downloadFile("komik_diedit.json", jsonData, "application/json");
        showAlert("Fail JSON sedang dimuat turun.", "success");
    };

    window.downloadTXT = () => {
        if (!comicData || comicData.length === 0) {
            showAlert("Tiada data untuk dimuat turun.", "warning");
            return;
        }
        let txtContent = "--- LAKARAN KOMIK ---\n\n";
        comicData.forEach((panelUtama, index) => {
            if (!panelUtama.subpanel || !panelUtama.subpanel[0]) return;
            const subP = panelUtama.subpanel[0];
            txtContent += `PANEL UTAMA ${index + 1}\n`;
            txtContent += `  Watak: ${subP.watak || '-'}\n`;
            txtContent += `  Aksi: ${subP.aksi || '-'}\n`;
            txtContent += `  Dialog: ${subP.dialog || '-'}\n`;
            txtContent += `  Sudut Kamera: ${subP.sudut || '-'}\n`;
            txtContent += `  Gaya Visual: ${subP.gaya || '-'}\n`;
            if (subP.penampilan) {
                txtContent += `  Penampilan:\n`;
                Object.entries(subP.penampilan).forEach(([key, value]) => {
                    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); 
                    txtContent += `    ${formattedKey}: ${value || '-'}\n`;
                });
            }
            txtContent += `\n------------------------\n\n`;
        });
        downloadFile("lakaran_komik_terkini.txt", txtContent, "text/plain");
        showAlert("Fail TXT sedang dimuat turun.", "success");
    };

    function showAlert(message, type = 'info') {
        // console.log(`Notifikasi (${type}): ${message}`); 
        
        const alertContainer = document.body; 
        let alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show fixed-top m-3`; 
        alertDiv.style.zIndex = "2000"; 
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const existingAlert = document.querySelector('.alert.fixed-top');
        if(existingAlert) existingAlert.remove();

        alertContainer.appendChild(alertDiv); 

        setTimeout(() => {
            if (alertDiv && alertDiv.parentElement) { 
                const bsAlert = (typeof bootstrap !== 'undefined' && bootstrap.Alert) ? bootstrap.Alert.getInstance(alertDiv) : null;
                if (bsAlert) {
                    bsAlert.close();
                } else {
                    alertDiv.remove(); 
                }
            }
        }, 5000); 
    }

    initializeApp();
});
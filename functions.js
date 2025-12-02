document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const resultCard = document.getElementById('result-card');
    const dropZone = document.getElementById('drop-zone');
    const btnReset = document.getElementById('btn-reset');

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) processXML(file);
    });

    btnReset.addEventListener('click', function() {
        location.reload();
    });

    function processXML(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const xmlText = e.target.result;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");

            const getText = (tag) => {
                const nodes = xmlDoc.getElementsByTagName(tag);
                return nodes.length > 0 ? nodes[0].textContent : "N/A";
            };

            try {
                // 1. Datos Personales
                const nombre = getText('NOMBRE');
                const calle = getText('DIRECC');
                const colonia = getText('COLONIA');
                const poblacion = getText('NOMPOB');
                const direccionCompleta = `${calle}, ${colonia}. ${poblacion}`;
                const rpu = getText('RPU');

                // 2. Fechas
                const fechaLimite = getText('FECLIMITE');
                const fechaDesde = getText('FECDESDE');
                const fechaHasta = getText('FECHASTA');

                // 3. Consumo y Tarifa
                const tarifa = getText('TARIFA');
                const consumo = getText('KWB01') || getText('DIFLEC1'); 

                // 4. Montos
                let montoMostrar = getText('Total'); 
                let nota = "";
                
                if (parseFloat(montoMostrar) === 0 || montoMostrar === "N/A") {
                    const cargoPeriodo = getText('Impo_Fact8');
                    if (cargoPeriodo && parseFloat(cargoPeriodo) > 0) {
                        montoMostrar = cargoPeriodo;
                        nota = "(Cargos del periodo detectados)";
                    } else {
                        montoMostrar = "0.00";
                        nota = "(No se detectó deuda pendiente)";
                    }
                }

                document.getElementById('rpu').textContent = rpu;
                document.getElementById('periodo').textContent = `${fechaDesde} - ${fechaHasta}`;
                document.getElementById('nombre').textContent = nombre;
                document.getElementById('direccion').textContent = direccionCompleta;
                document.getElementById('fecha-limite').textContent = fechaLimite;
                document.getElementById('consumo').textContent = consumo + " kWh";
                document.getElementById('tarifa').textContent = tarifa;
                
                const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
                document.getElementById('monto').textContent = formatter.format(montoMostrar);
                document.getElementById('nota-monto').textContent = nota;

                // Si es DAC, solo cambiamos el color del texto de la tarifa, ya no mostramos la alerta
                if (tarifa.includes('DAC')) {
                    document.getElementById('tarifa').style.color = '#ef4444'; // Rojo
                    document.getElementById('tarifa').style.fontWeight = 'bold';
                } else {
                    document.getElementById('tarifa').style.color = 'var(--text-main)';
                }

                dropZone.style.display = 'none';
                resultCard.style.display = 'block';

            } catch (error) {
                alert("Error al leer el XML. Asegúrate de que sea un archivo válido de CFE.");
                console.error(error);
            }
        };
        reader.readAsText(file);
    }
});
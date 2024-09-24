

 const selects = document.getElementById('dep');
 const formulario = document.getElementById('formulario');
 const busqueda = document.getElementById('busqueda');
 const ubicacion = document.getElementById('ubicacion');
 const deptos= document.getElementById('dep');
 const galeria = document.getElementById('galeria');
 const footer = document.getElementById('footer');


const url='https://collectionapi.metmuseum.org/public/collection/v1/';
let pagActual = 1;
let pagTotales = 0;


function llenarDep() {
    pagActual =1;
 const departamentos = fetch(`${url}/departments`)
 .then((respuesta) => respuesta.json()).then
((datos)=>{




  const todos = document.createElement('option')
  todos.setAttribute('value', "0");
  todos.textContent= "Todos";
  selects.appendChild(todos);
  datos.departments.forEach(element => {

    const item = document.createElement('option');
    item.setAttribute('value', element.departmentId)
    item.textContent = element.displayName;

    selects.appendChild(item);

    
  });
});



}

llenarDep();


formulario.addEventListener('submit',(evento)=>{
    
    evento.preventDefault();
    pagActual = 1;
    const qbuscar = busqueda.value;
    const qubicacion = ubicacion.value;
    const qdepartamentos = deptos.value;

    const qobjeto= {};

    qobjeto.busqueda = qbuscar;

   
    if(qubicacion){
        qobjeto.ubicacion = qubicacion;
    }else{

        qobjeto.ubicacion = "";
    }

    if(qdepartamentos)
    {
        qobjeto.departamento = qdepartamentos;
     } else{

        qobjeto.departamento = "";

     }

    busquedaPaginacion(qobjeto);

    



});

    function busquedaPaginacion(qobjeto){

        const propiedades = [];

        if(qobjeto.busqueda)
        {
            propiedades.push('q='+ qobjeto.busqueda);

        }

        else{

            propiedades.push('q=""');  

        }

        if (qobjeto.ubicacion && qobjeto.ubicacion.value != "Todos")
        {
            propiedades.push('geoLocation=' + qobjeto.ubicacion);

        }
        else{
            
            propiedades.push('geoLocation=' + "");


        };
        if(qobjeto.departamento && qobjeto.departamento != "0")
        {
            propiedades.push('departmentId='+ qobjeto.departamento);

        }
        else{

            propiedades.push('departmentId='+ "");

        }

        if(propiedades.length!=0){
        const qurl = url + 'search' + '?'+ propiedades.join('&');
        }
        else{

            const qurl=url + 'search' + '?';

        }
       
        fetch (qurl)
        .then((res) => res.json())
        .then((result)=>{
            if(result.objectIDs && result.objectIDs.length>0){
            pagTotales= Math.ceil(result.total/20);

            crearFooter(pagTotales);
            const totalID = result.objectIDs.slice((pagActual-1) *20,pagActual *20);
            tarjetas(totalID);
            }else{
                galeria.innerHTML ='<h1> No Hay Resultados, intente con diferentes criterios </h1>';
                footer.innerHTML= '';

            }
        })
        .catch((error)=> {
            console.log('error buscando: ', error);
        })
        
    }

    function crearFooter (pagTotales){
        footer.innerHTML= '';

        for (let index = 1; index <= pagTotales && index <= 20; index++) {
            const botonFooter = document.createElement('button');
            botonFooter.textContent = index;

            footer.appendChild(botonFooter);
            
            botonFooter.addEventListener('click', () => {

                pagActual = index;

                busquedaPaginacion({

                    busqueda: busqueda.value,
                    ubicacion: ubicacion.value,
                    departamento: deptos.value




            })


            })
        }


    }


    function tarjetas(totalID){
        galeria.innerHTML= '';
        totalID.forEach(id => {
            fetch(url + '/objects/'+ id)
            .then((res)=> res.json())
            .then((objeto) => {

                if (objeto.title === undefined){

                    return;

                }
               
                const contenedorTarjeta = document.createElement('div')
                contenedorTarjeta.setAttribute('class', 'contenedorInd')

                const imagen = document.createElement('img');
                if (objeto.primaryImageSmall != ''){
                imagen.setAttribute('src',objeto.primaryImageSmall);}

                else{
                imagen.setAttribute('src', 'https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg?w=1060');}

                imagen.setAttribute('title', objeto.objectDate);
                imagen.classList.add('imagen-tarjeta');

                const titulo = document.createElement('h4');
                

                const cultura = document.createElement('p');
                if( objeto.culture === "" ){
                cultura.textContent = `Cultura: no especificada`;
                  
                }
                else 

               {
               cultura.textContent = `Cultura: ${objeto.culture}`;
                    
                    
                }
                
                const dinastia = document.createElement('p');
                if(objeto.dynasty && objeto.dynasty.trim() !==""){
                    dinastia.textContent = `Dinastia: ${objeto.dynasty}`;

               
                     }
                else {
                    dinastia.textContent = `Dinastia: no especificada`;
                };
                

                traducir(objeto.title, objeto.culture, objeto.dynasty)
                .then(traducciones => {

                    titulo.textContent = traducciones[0];
                   if(cultura.textContent !=`Cultura: no especificada` )
                    cultura.textContent = `Cultura: ${traducciones[1]};`
                    
                    if(dinastia.textContent != `Dinastia: no especificada`)
                    dinastia.textContent =`Dinastia: ${traducciones[2]};`
                   
               
                    
                if(cultura.textContent==="")
                    {
                        console.log("entro");
                    }


                });

                if(objeto.additionalImages && objeto.additionalImages.length > 0){
                        
                        const linkSecundarias = document.createElement('a');
                        linkSecundarias.textContent = "ver imagenes adicionales"
                        linkSecundarias.href = `adicionales.html?id=${id}`;
                        contenedorTarjeta.appendChild(linkSecundarias);



                };


                contenedorTarjeta.appendChild(imagen);
                contenedorTarjeta.appendChild(titulo);
                contenedorTarjeta.appendChild(cultura);
                contenedorTarjeta.appendChild(dinastia);
                galeria.appendChild(contenedorTarjeta);

            });
            
        });




    };

    async function traducir(titulo, cultura, dinastia) {
       

            const resp = await fetch('/traducir',{

                method: 'POST',
                headers: {

                    'Content-type': 'application/json'
                },

                body: JSON.stringify({titulo, cultura, dinastia})




            });
            if (!resp.ok) {
               
                 throw new Error('Error en la traducción');
            };
            
            const data = await resp.json();
           
            return data.titulosTraducidos;

        
    }

  
  
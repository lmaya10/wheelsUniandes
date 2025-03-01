import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './PpalLog.css';
import unirse from '../../assets/unirse.png';
import crear from '../../assets/crear.png';
import { useHistory } from "react-router-dom";
import { func } from 'prop-types';

function PpalLog(props) {

  const [pregDestino, setPregDestino] = useState(false);
  const [destino, setDestino] = useState('');
  const [origen, setOrigen] = useState('');
  const [maxInicio, setMaxInicio] = useState('');
  const [maxDestino, setMaxDestino] = useState('');
  const [lista, setLista] = useState([]);

  const backUrl = "https://wheelsuniandes.herokuapp.com";

  let history = useHistory();
  function crearRuta() {
    history.push("/crearRuta");
  }

  useEffect (()=>{
    props.funcionMisWheels(props.cookies.get('wheelsUser'),props.cookies.get('wheelsToken'));
    props.funcionServicios(props.cookies.get('wheelsUser'),props.cookies.get('wheelsToken'));
  },[])

  function handleSubmit(e) {

    e.preventDefault();
    confirmarServicio();
  }


  const confirmarServicio = () => {
    (async () => {
      const user = props.cookies.get('wheelsUser');
      const body = JSON.stringify({
        "direccionInicio": origen,
        "direccionFin": destino
      });
      const req = await fetch(`${backUrl}/services/confirmarMapa`, {
        method: 'POST',
        body: body,
        headers: {
          'Authorization': `Bearer ${props.cookies.get('wheelsToken')}`,
          'user': JSON.stringify(user),
          'Content-Type': 'application/json'
        }
      });
      const rta = await req.json();

      const tempO = rta.resultadoInicio.results[0].geometry.location;
      const tempD = rta.resultadoFin.results[0].geometry.location;
      consultarServicios(tempO.lat, tempO.lng, tempD.lat, tempD.lng, +(maxInicio), +(maxDestino));
    })();

  }

  const consultarServicios = (latOrigen, lonOrigen, latDestino, lonDestino, maxDistInicio, maxDistFinal) => {
    (async () => {
      const user = props.cookies.get('wheelsUser');
      const bodyService = JSON.stringify({
        "fin": {
          "lat": latDestino,
          "lng": lonDestino
        },
        "inicio": {
          "lat": latOrigen,
          "lng": lonOrigen
        },
        "maxDistInicio": maxDistInicio,
        "maxDistFinal": maxDistFinal
      });
      const req = await fetch(`${backUrl}/services/buscarServicio`, {
        method: 'POST',
        body: bodyService,
        headers: {
          'Authorization': `Bearer ${props.cookies.get('wheelsToken')}`,
          'user': JSON.stringify(user),
          'Content-Type': 'application/json'
        }
      });
      const rta = await req.json();
      setLista(rta);
      // history.push('/rutasDisponibles');
    })();
  }


  function preguntarDestino() {
    setPregDestino(true);
  }

  const unirseRuta = (bodyParam) => {
    (async () => {

      const user = props.cookies.get('wheelsUser');
      const bodyService = JSON.stringify(bodyParam);
      const req = await fetch(`${backUrl}/services/unirseServicio`, {
        method: 'POST',
        body: bodyService,
        headers: {
          'Authorization': `Bearer ${props.cookies.get('wheelsToken')}`,
          'user': JSON.stringify(user),
          'Content-Type': 'application/json'
        }
      });
      const rta = await req.json();
      console.log(rta);
      // history.push('/rutasDisponibles');

    })();
  }



  function reservar(bodyParam) {
    const newBody =
    {
      "uid": props.allCookies.wheelsUser.uid,
      "idService": bodyParam._id,
      "destino": bodyParam.destination
    }
    unirseRuta(newBody);
  }


  console.log(props.servicios);
  return (
    props.cookies.cookies.wheelsToken ?
      <div className="App">
        <div className="container heading">
          <h1>Bienvenido {props.allCookies.wheelsUser.uid} </h1>
          <p>Si deseas <strong>crear</strong> rutas de wheels, primero debes <strong><a href="/misCarros">añadir algún vehículo</a></strong> y luego puedes clickear en el botón a tu izquierda.</p>
          <p>Si deseas <strong>unirte</strong> a alguna ruta sólo debes clickear en el botón a tu derecha y dar la información necesaria.</p>
          <div className="row heading">
            <div className="col">
              <button onClick={crearRuta} className="btn yellow-black">Crear ruta de Wheels</button>
              <img className="wheels" src={crear} ></img>
            </div>
            <div className="col">
              {
                pregDestino && lista.length === 0 ?
                  <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="origen">¿De dónde sales?</label>
                      <input required type="text" className="form-control" id="origen" onChange={e => setOrigen(e.target.value)} placeholder="Ingresa el origen" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="destino">¿A dónde te diriges?</label>
                      <input required type="text" className="form-control" id="destino" onChange={e => setDestino(e.target.value)} placeholder="Ingresa tu destino" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="distInicio">Distancia de punto de origen en metros</label>
                      <input required type="text" className="form-control" id="distInicio" onChange={e => setMaxInicio(e.target.value)} placeholder="Máxima distancia en metros de inicio" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="distDestino">Distancia de punto de destino en metros</label>
                      <input required type="text" className="form-control" id="distDestino" onChange={e => setMaxDestino(e.target.value)} placeholder="Máxima distancia en metros de destino" />
                    </div>
                    <button type="submit" className="btn yellow-black">Buscar</button>
                  </form>
                  :
                  pregDestino && lista.length >= 0 ?
                    <div>
                      <h2>Rutas disponibles</h2>
                      {lista
                        .map((element) => {
                          //const param = element;
                          return <div key={element.servicio._id} style={{ marginBottom: 1.5 + 'rem' }}>
                            <button onClick={() => reservar(element.servicio)} className="btn yellow">Reservar</button>servicio de {element.servicio.dueño}. Duración aproximada del viaje: {element.servicio.duracionAprox}
                          </div>
                        })
                        // <option disabled>Agrega algún carro</option>
                      }
                    </div>
                    :
                    <div>
                      <button onClick={preguntarDestino} className="btn yellow-black">Unirse a ruta de Wheels</button>
                      <img className="wheels" src={unirse} ></img>
                    </div>
              }
            </div>
          </div>
          <div className="row heading">
            <div className="col">
            <h2>Mis wheels</h2>
            {props.misWheels.map((element)=>{return <p>Ruta de {element.distancia} con una duración aproximada de {element.duracionAprox}. Tiene actualmente {element.usuarios.length} usuario(s).</p>})}
            </div>
            <div className="col">
            <h2>Todos los servicios</h2>
            {props.servicios.map((element)=>{return <p> Ruta de {element.dueño}, con una duración aproximada de {element.duracionAprox} y una distancia de {element.distancia}. Tiene actualmente {element.usuarios.length} usuario(s).</p>})}
              </div>
          </div>
        </div>
      </div>
      :
      <div className="App heading"><h2>Redirígete a <a href="/"> la página principal</a>. <br /> Debes iniciar sesión para usar el contenido de Wheels Uniandes</h2></div>
  );
}

export default PpalLog;
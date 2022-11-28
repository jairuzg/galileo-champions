const getTopRockstarErrorTemplate = (message, rockstarPeriod) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <style>
        p, a, h1, h2, h3, h4, h5, h6 {font-family: 'Roboto', sans-serif !important;}
        h1{ font-size: 30px !important;}
        h2{ font-size: 25px !important;}
        h3{ font-size: 18px !important;}
        h4{ font-size: 16px !important;}
        p, a{font-size: 15px !important;}

        .claseBoton{
            width: 30%;
                background-color: #fcae3b;
                border: 2px solid #fcae3b;
                color: black; 
                padding: 16px 32px;
                text-align: center;
                text-decoration: none;
                font-weight: bold;
                display: inline-block;
                font-size: 16px;
                margin: 4px 2px;
                transition-duration: 0.4s;
                cursor: pointer;
        }
        .claseBoton:hover{
            background-color: #000000;
            color: #ffffff;
        }
        .imag{
            width: 20px;
            height: 20px;
        }
        .contA{
            margin: 0px 5px 0 5px;
        }
        .afooter{
            color: #ffffff !important; 
            text-decoration: none;
            font-size: 13px !important;
        }
    </style>
</head>
<body>
    <div style="width: 100%; background-color: #e3e3e3;">
        <div style="padding: 20px 10px 20px 10px;">
            <!-- Imagen inicial -->
            <div style="background-color: #000000; padding: 10px 0px 10px 0px; width: 100%; text-align: center;">
                <img src="https://galileochampions.jaguergo.org/images/logo.png" alt="" style="width: 200px; height: 200px;">
            </div>
            <!-- Imagen inicial -->

            <!-- Contenido principal -->
            <div style="background-color: #ffffff; padding: 20px 0px 5px 0px; width: 100%; text-align: center;">
                <h1>Ocurrio un error!</h1>
                <p>No pudimos almacenar los rockstar del periodo ${rockstarPeriod.representation}</p>
                <code>${message}</code>

                <!-- Gracias -->
                
                <p style="margin-bottom: 50px;"><i>Atentamente:</i><br>Equipo GalileoChampions</p>

                <!-- Botón -->
                <a class="claseBoton" href="https://galileochampions.jaguergo.org/">Galileo Champions</a>
            </div>
            <!-- Contenido principal -->

            <!-- Footer -->
            <div style="background-color: #282828; color: #ffffff; padding: 5px 0px 0px 0px; width: 100%; text-align: center;">
                <h4>Soporte</h4>
                <p style="font-size: 13px; padding: 0px 20px 0px 20px;">
                    Comunícate con nosotros por los siguientes medios:<br>
                    Correo: <a class="afooter" href="mailto:galileo.champions@gmail.com">galileo.champions@gmail.com</a><br>
                </p>
            </div>
            <!-- Footer -->
        </div>
    </div>
</body>
</html>
`
};

module.exports = {
    getTopRockstarErrorTemplate: getTopRockstarErrorTemplate
}
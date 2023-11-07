const register = () => `<html>
    <head>
        <title>Confirmación de Registro</title>
    </head>
    <body>
        <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center">
                    <h1>Confirmación de Registro</h1>
                </td>
            </tr>
            <tr>
                <td>
                    <p>¡Gracias por registrarte en Cumbi!
                    <br/>La información suministrada sera revisada en máximo 48 horas, de ser aceptada podrás empezar a realizar facturas,
                    mientras puedes ingresar a <a target="_blank" href="https://cumbi.co">CUMBI</a>.</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p>Si no realizaste esta solicitud de registro, puedes ignorar este mensaje.</p>
                </td>
            </tr>
        </table>
        <footer>
            <div className="credits">
                Visítanos en <a target="_blank" href="https://cumbi.co">Cumbi</a>
            </div>
        </footer>
    </body>
</html>`;

const invoiceCreated = ({ url }) => `<html>
    <head>
        <title>Nueva factura</title>
    </head>
    <body>
        <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center">
                    <h1>Nueva factura</h1>
                </td>
            </tr>
            <tr>
                <td>
                    <p>Se ha creado una nueva factura en tu cuenta de Cumbi
                    <br/>Entra a <a target="_blank" href="${url}">CUMBI</a> para revisarla.</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p></p>
                </td>
            </tr>
        </table>
        <footer>
            <div className="credits">
                Visítanos en <a target="_blank" href="https://cumbi.co">Cumbi</a>
            </div>
        </footer>
    </body>
</html>`;

const invoicePaid = ({ _id }) => `<html>
    <head>
        <title>Nuevo pago</title>
    </head>
    <body>
        <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center">
                    <h1>Nuevo pago</h1>
                </td>
            </tr>
            <tr>
                <td>
                    <p>Una de tus facturas en Cumbi ha recibido un pago
                    <br/>Entra a <a target="_blank" href="https://cumbi.co">CUMBI</a> para revisar la factura: ${_id}.</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p></p>
                </td>
            </tr>
        </table>
        <footer>
            <div className="credits">
                Visítanos en <a target="_blank" href="https://cumbi.co">Cumbi</a>
            </div>
        </footer>
    </body>
</html>`;

const kycStatusUpdate = (options) => {
    const { kycStatus } = options;
    const messages = {
        pending: 'Tu estado de KYC está pendiente de revisión.',
        accepted: '¡Felicidades! Tu estado de KYC ha sido aceptado.',
        denied: 'Tu estado de KYC ha sido denegado.',
    };

    const message = messages[kycStatus] || 'Tu estado de KYC ha cambiado.';

    return `<html>
      <head>
          <title>Estado KYC: ${kycStatus}</title>
      </head>
      <body>
          <h1>Estado KYC: ${kycStatus}</h1>
          <p>${message}</p>
          <footer>
              Visítanos en <a target="_blank" href="https://cumbi.co">Cumbi</a>
          </footer>
      </body>
  </html>`;
};


const validation = () => '';

module.exports = {
    register,
    invoiceCreated,
    invoicePaid,
    validation,
    kycStatusUpdate,
};

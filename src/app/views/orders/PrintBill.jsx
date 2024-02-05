import React, { useState } from 'react';
import logo from "../../../assets/images/logo.svg"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { SimpleCard } from 'app/components'
import { Button, Grid, Icon, styled, Box } from '@mui/material'
import { Span } from 'app/components/Typography'
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator'
import { LogoWithTitle } from 'app/components'
import { GrozpSnackbar } from 'app/components/'
import { url } from 'app/constants'
import sign from "../../../assets/images/signature.jpeg"
const Container = styled('div')(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: { marginBottom: '16px' },
  },
}))
const TextField = styled(TextValidator)(() => ({
  width: '100%',
  marginBottom: '16px',
}))
const PrintBill = () => {
  const [state, setState] = useState('')
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const [severity, setSeverity] = useState('success')
  const { orderId } = state

  const handleChange = (event) => {
    event.persist()
    setState({
      ...state,
      [event.target.name]: event.target.value,
    })
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const handleShowSnackbar = (msg, type) => {
    setOpen(true)
    setMsg(msg)
    setSeverity(type)
  }
  const handleSubmit = () => {
    url.get(`v1/in/orders/details?id=${orderId}`)
      .then((response) => {
        if (response.data.status === true) {
          const data = response.data.data;
          const InvoiceId = data.invoiceId;
          const Name = data.name;
          const phoneno = data.phone;
          const Altphone = data.phoneAlt;
          const StorePhone = data.storePhone;
          const OrderDateTime = data.orderDateTime;
          const PaymentType = data.billingInfo.paymentType;
          const StoreAddress = data.storeAddress;
          const Orderitems = data.orderItem;
          console.log("order", Orderitems);
          const Address = data.address;
          const Gstin = data.gstNumber;
          const StoreName = data.headQuater;
          const DeliveryCharge = data.billingInfo.deliveryCharge;
          const PromoDiscount = data.billingInfo.promoDiscount;
          const LoyaltyPoints = data.billingInfo.loyaltyPoints;
          const ReturnAmount = data.billingInfo.returnPoint;
          const SubTotal = data.billingInfo.subTotal;
          const Total = data.billingInfo.itemTotal;
          const PayableTotal = data.billingInfo.grandTotal;
          const CompanyName = data.companyName;
          const printWindow = window.open('', '_blank');
          const invoiceContent = getInvoiceContent(Name, phoneno, Altphone, OrderDateTime, PaymentType, StoreAddress, Orderitems, InvoiceId, Address, Gstin, StoreName, DeliveryCharge, SubTotal, LoyaltyPoints, ReturnAmount, PromoDiscount, Total, PayableTotal, StorePhone, CompanyName); // Pass the data to the function
          printWindow.document.write(invoiceContent);

          // setTimeout(() => {
          //     html2canvas(printWindow.document.body).then(canvas => {
          //         const imageData = canvas.toDataURL('image/png');

          //         const pdf = new jsPDF('p', 'mm', 'a4');
          //         pdf.addImage(imageData, 'PNG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);

          //         pdf.save('invoice.pdf');

          //         printWindow.close();
          //     });
          // }, 1000); 
        }
      })
      .catch((error) => {
        handleShowSnackbar('Error fetching data', 'error');
      });
  };
  const getInvoiceContent = (Name, phoneno, Altphone, OrderDateTime, PaymentType, StoreAddress, Orderitems, InvoiceId, Address, Gstin, StoreName, DeliveryCharge, SubTotal, LoyaltyPoints, ReturnAmount, PromoDiscount, Total, PayableTotal, StorePhone, CompanyName) => {
    let orderItemsContent = '';
    let totalItemsCount = Orderitems.length;
    Orderitems.forEach((item, index) => {
      orderItemsContent += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.itemName}, ${item.size}</td>
                    <td>${item.hsnCode}</td>
                    <td>₹${item.mrp}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.beforeTax}</td>
                    <td>${item.cgst}%</td>
                    <td>${item.sgst}%</td>
                    <td>${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
            `;
    });
    return `
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
          body{
            font-family:Arial,sans-serif;
          }
          .image{
            text-align:center;
            font-size:20px;
            font-weight:600;
          }
          .invoice-details{
            display:flex;
            justify-content:space-between;
            padding-left:50px;
            padding-right:25px;
            font-size:20px;
          }
          .invoice-details-footer{
            display:flex;
            justify-content:space-between;
            padding-left:30px;
            padding-right:55px;
            font-size:20px;
            font-weight:600;
          }
          .left-content{
            text-align:left;
            disply:flex;
          }
          .right-content{
            text-align:right;
          }
          .right-content-footer{
            text-align:center;
          }
          .table{
            width:100%;
            border-collapse:collapse;
          }
          table th{
            border-top:2px solid black;
            border-bottom: 2px solid black;
          }
          table th, .table td{
            padding:8px;
            text-align:center;
          }
          .divider{
            border:1px solid;
            width:129px;
          }
          .div_wrap{
            display:flex;
            justify-content:end;
          }
          .total_amount{
            text-align:end;
            padding-right:32px;
            padding-top:10px;
          }
          .gst{
            display:flex;
            justify-content:end;
            gap:55px;
            padding-right:16px;
            line-height:0px;
          }
          .final_total{
            display:flex;
            justify-content:end;
            gap:60px;
            padding-right:35px;
            font-weight:600;
          }
          .div_line{
            border:1px solid;
          }
          .acc_details{
            display:flex;
            line-height:0px;
          }
          .acc_details_total{
            display:flex;
            padding-left:30px;
          }
          .details_heading{
            width:150px;
            font-size:16px;
            font-weight:700;
          }
          .details_heading_header{
            width:130px;
            font-size:16px;
            font-weight:700;
          }
          .acc_details_section{
            display: flex;
            justify-content: space-around;
          }
          .gst-heading{
            font-weight:bold;
          }
          .footer{
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            padding-left: 30px;
            padding-right: 20px
          }
          .footer-name{
            text-align:end;
            padding-right:20px;
          }
          .greeting{
            text-align: center;
            font-weight: 600;
            line-height: 5px;
            font-size:20px;
          }
          .flex-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .border {
           width:2px;
           background-color:black;
          }          
          .right {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size:16px;
            font-weight:600;
          }
          .left{
            margin-top:10px;
            margin-bottom:10px;
          }
          .details_value{
            font-size:16px;
          }
          </style>
        </head>
        <body>
          <div class="image">
            <img src=${logo} alt="logo"/>
            <p>${StoreName}</p>
            <p>${StoreAddress}</p>
            <p>GSTIN/NO : ${Gstin}</p>
          </div>
            
          <div class="invoice-details">
            <div class="left-content">
              <div class="acc_details">
                <p class="details_heading_header"> Buyer </p><p class="details_value"> :&nbsp; ${Name}</p>
              </div>
              <div class="acc_details">
                <p class="details_heading_header"> Phone No</p><p class="details_value">:&nbsp; ${phoneno}
              </div>
              <div class="acc_details">
                <p class="details_heading_header"> Alternet Mobile</p><p class="details_value"> :&nbsp; ${Altphone} </p>
              </div>
              <div class="acc_details">
                <p class="details_heading_header"> Payment Type</p><p class="details_value"> :&nbsp; ${PaymentType}</p>
              </div>
              <div class="acc_details">
                <p class="details_heading_header"> Address </p><p class="details_value">:&nbsp; ${Address}</p>
              </div>
            </div>
            <div class="right-content">
              <div class="acc_details">
                <p class="details_heading_header"> Bill No </p><p class="details_value">&nbsp; : ${InvoiceId} </p>
              </div>
              <div class="acc_details">
                <p class="details_heading_header"> Date and Time </p><p class="details_value">&nbsp;: ${OrderDateTime}</p>
              </div>
            </div>
          </div>

          <div class="line"></div>

          <table class="table">
            <thead>
              <tr>
                <th>Sl : No</th>
                <th>Product Name & Size</th>
                <th>HSN</th>
                <th>MRP</th>
                <th>QTY</th>
                <th>Rate</th>
                <th>CGST</th>
                <th>SGST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsContent}
            </tbody>
          </table>

          <div class="div_line"></div>

          <div class="final_total">
            <p> Total </p>
            <p> ${totalItemsCount}Nos </p>
            <p> ${SubTotal} </p>
          </div>

          <div class="div_line"></div>

          <div class="acc_details_section">
          
          <div class="left">
            <div class="acc_details">
              <p class="details_heading"> Total Amount </p><p> : ${Total.toFixed(2)}</p>
            </div>
            <div class="acc_details">
              <p class="details_heading"> Sub Total Amount </p><p> : ${SubTotal.toFixed(2)}</p>
            </div>
            <div class="acc_details">
              <p class="details_heading"> Delivery Charge </p><p> : ${DeliveryCharge}</p>
            </div>
            <div class="acc_details">
              <p class="details_heading"> Promo Discount </p><p> : ${PromoDiscount}</p>
            </div>
            <div class="acc_details">
              <p class="details_heading"> Loyalty Points </p><p> : ${LoyaltyPoints}</p>
            </div>
            <div class="acc_details">
              <p class="details_heading"> Return Amount </p><p> : ${ReturnAmount}</p>
            </div>
            <div class="acc_details">
              <p class="details_heading"> Payable Amount </p><p> : ${PayableTotal.toFixed(2)}</p>
            </div>
            </div>
            <div class="border"></div>
            <div class="right">
              <div>
                <p>C/SGST @2.5% On 1,000 : 200</p>
                <p>C/SGST @2.5% On 1,000 : 200</p>
                <p>C/SGST @2.5% On 1,000 : 200</p>
                <p>C/SGST @2.5% On 1,000 : 200</p>
              </div>
            </div>
            
          </div>

          <div class="div_line"></div>

          <div class="footer">
            <div>
              <p>Terms & Conditions</p>
            </div>
            <div>
              <p> Authorised Signature</p>
            </div>
          </div>

          <div class="footer">
            <div>
              <p> All invoices due in 7 days from date of issues. All estimates are valid up to 7 days</br>
                from date of issue. No refunds are accepted after delivery!</p>
            </div>
            <div>
              <img src=${sign} />
            </div>
          </div>

          <div class="footer-name">
            <p>For M/s ${CompanyName}</p>
          </div>

          <div class="greeting">
            <div>
              <p>Thank You!</p>
            </div>
            <div>
              <p>Visit Again!</p>
            </div>
          <div>
          
          <script>
            window.onafterprint = function () {
              window.close();
            };
          </script>
        </body>
      </html>
    `;
  };

  return (
    <Container>
      <LogoWithTitle
        src="/assets/Orders/invoice.png"
        title="Print Bill "
      />
      <GrozpSnackbar
        open={open}
        handleClose={handleClose}
        msg={msg}
        severity={severity}
      />
      <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
        <SimpleCard title="Print Invoice ">
          <Box overflow="auto">
            <Grid container spacing={6}>
              <Grid
                item
                lg={6}
                md={6}
                sm={12}
                xs={12}
                sx={{ mt: 2 }}
              >
                <TextField
                  type="number"
                  name="orderId"
                  id="standard-basic"
                  value={orderId || ''}
                  onChange={handleChange}
                  errorMessages={['this field is required']}
                  label="Order ID(Ex:123)"
                  validators={[
                    'required',
                    'minStringLength: 1',
                  ]}
                  inputProps={{ min: '0' }}
                />
              </Grid>
            </Grid>
          </Box>
          <Button color="primary" variant="contained" type="submit">
            <Icon>send</Icon>
            <Span
              sx={{
                pl: 1,
                textTransform: 'capitalize',
              }}
            >
              Submit
            </Span>
          </Button>
        </SimpleCard>
      </ValidatorForm>
    </Container>
  );
};

export default PrintBill;

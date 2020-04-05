'use strict';
const escpos = require('escpos');
const path = require('path')
escpos.USB = require('escpos-usb')

const device  = new escpos.USB();
const options = { encoding: 'GB18030', lineWidth: 32 }
const printer = new escpos.Printer(device, options);
const blank = path.join(__dirname, 'blank.png');

exports.receipt = (req, res) => {
    const data = req.body
    let error

    escpos.Image.load(!data.logo_remove ? data.logo : blank, function(image){
        device.open(function(error){
            error = error
            printer.font('A')
                .align('ct')
                .style('B')
                .size(1,1)
                .text(data.shop_name)
                .image(image, 'd8')
                .then(function(){
                    printer.style('NORMAL')
                        .text(data.address)
                        .text(data.phone_number)
                        .text('')
                        .align('LT')
                        .tableCustom([
                            { 
                                text: 'Nomor',
                                align: 'LEFT',
                                width: 0.25,
                            },
                            { 
                                text: data.number,
                                align: 'RIGHT',
                                width: 0.5
                        }])
                        .tableCustom([
                            { 
                                text: 'Tanggal',
                                align: 'LEFT',
                                width: 0.25,
                            },
                            { 
                                text: data.date,
                                align: 'RIGHT',
                                width: 0.5
                        }])
                        .tableCustom([
                            { 
                                text: 'Kasir',
                                align: 'LEFT',
                                width: 0.25,
                            },
                            { 
                                text: data.cashier,
                                align: 'RIGHT',
                                width: 0.5
                        }])
                        if (data.customer_name) {
                            printer.tableCustom([
                                { 
                                    text: 'Pelanggan',
                                    align: 'LEFT',
                                    width: 0.25,
                                },
                                { 
                                    text: data.customer_name,
                                    align: 'RIGHT',
                                    width: 0.5
                            }])
                        }
                        printer.align('CT')
                        .text(data.divider)
                        .text('')
                        .align('LT')
                        data.details && data.details.map(cart => {
                            printer.text(cart.item_name)
                            .tableCustom([
                                { text: `x${cart.qty} ${cart.price_formatted}`,
                                    align: 'LEFT',
                                    width: 0.38,
                                },
                                {
                                    text: cart.subtotal_formatted,
                                    align: 'RIGHT',
                                    width: 0.38
                            }])

                            if (cart.discount > 0) {
                                printer.align('LT')
                                .tableCustom([
                                    { text: 'Diskon',
                                        align: 'LEFT',
                                        width: 0.38,
                                    },
                                    {text: `- ${cart.discount_formatted}`,
                                    align: 'RIGHT',
                                    width: 0.38
                                }])
                            }
                        })
                        printer.align('CT')
                        .text(data.divider)
                        .text('')
                        .align('LT')
                        .tableCustom([
                            { text: 'Subtotal',
                                align: 'LEFT',
                                width: 0.38,
                            },
                            {text: data.subtotal_formatted,
                            align: 'RIGHT',
                        width: 0.38
                    }])
                    if (data.total_discount) {
                        printer.tableCustom([
                            { text: 'Total Diskon',
                                align: 'LEFT',
                                width: 0.38,
                            },
                            {text: `-${data.total_discount_formatted}`,
                            align: 'RIGHT',
                        width: 0.38
                    }])
                    }
                    printer
                        .tableCustom([
                            { text: 'Pajak',
                                align: 'LEFT',
                                width: 0.38,
                            },
                            {text: data.tax_formatted,
                            align: 'RIGHT',
                        width: 0.38
                    }])
                    .tableCustom([
                        { text: 'Total',
                            align: 'LEFT',
                            width: 0.38,
                        },
                        {text: data.total_formatted,
                        align: 'RIGHT',
                    width: 0.38
                }])
                        .tableCustom([
                            { text: data.payment_type === 'cash' ?  'Tunai' : 'Kartu',
                                align: 'LEFT',
                                width: 0.38,
                            },
                            { text: data.amount_formatted,
                            align: 'RIGHT',
                        width: 0.38
                    }])
                        .tableCustom([
                            { text: 'Kembalian',
                                align: 'LEFT',
                                width: 0.38,
                            },
                            {text: data.change_formatted,
                            align: 'RIGHT',
                        width: 0.38
                    }])
                        .align('CT')
                        .text(data.divider)
                        .text('')
                        .text('Terimakasih Telah Berkunjung')
                        .text('Dibuat oleh Kasir Kita')
                        .cut()
                        .close();
                });
    
        });
    });

    if (error) {

        res.status(500).json({
            "message": error
        })

    } else {

        res.status(200).json({
            "message": "Struk berhasil dicetak"
        })
    }
}
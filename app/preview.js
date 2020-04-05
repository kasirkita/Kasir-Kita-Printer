'use strict';
const escpos = require('escpos');
const path = require('path')
escpos.USB = require('escpos-usb')

const device  = new escpos.USB();
const options = { encoding: 'GB18030', lineWidth: 32 }
const printer = new escpos.Printer(device, options);
const blank = path.join(__dirname, 'blank.png');

exports.preview = (req, res) => {
    const data = req.body
    let error

    escpos.Image.load(!data.logo_remove ? data.logo : blank, function(image){
        device.open(function(error){
            error = error
            printer.font('A')
                .align('ct')
                .style('B')
                .text(data.name)
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
                        .align('CT')
                        .text(data.divider)
                        .text('')
                        .align('LT')
                        data.carts && data.carts.map(cart => {
                            printer.text(cart.name)
                            .tableCustom([
                                { text: `x${cart.qty} ${cart.price}`,
                                    align: 'LEFT',
                                    width: 0.38,
                                },
                                {
                                    text: cart.subtotal,
                                    align: 'RIGHT',
                                    width: 0.38
                            }])

                            if (cart.discount_amount) {
                                printer.align('RT')
                                .tableCustom([
                                        { text: 'Diskon',
                                            align: 'LEFT',
                                            width: 0.38,
                                        },
                                        {text: `-${cart.discount_amount}`,
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
                            {text: data.subtotal,
                            align: 'RIGHT',
                        width: 0.38
                    }])
                        .tableCustom([
                            { text: 'Pajak',
                                align: 'LEFT',
                                width: 0.38,
                            },
                            {text: data.tax,
                            align: 'RIGHT',
                        width: 0.38
                    }])
                    .tableCustom([
                        { text: 'Total Diskon',
                            align: 'LEFT',
                            width: 0.38,
                        },
                        {text: data.total_discount,
                        align: 'RIGHT',
                    width: 0.38
                }])
                    .tableCustom([
                        { text: 'Total',
                            align: 'LEFT',
                            width: 0.38,
                        },
                        {text: data.total,
                        align: 'RIGHT',
                    width: 0.38
                }])
                        .tableCustom([
                            { text: data.payment_type,
                                align: 'LEFT',
                                width: 0.38,
                            },
                            { text: data.amount,
                            align: 'RIGHT',
                        width: 0.38
                    }])
                        .tableCustom([
                            { text: 'Kembalian',
                                align: 'LEFT',
                                width: 0.38,
                            },
                            {text: data.change,
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
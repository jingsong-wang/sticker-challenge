export function compose(ctx,image,sticker=null,blank=false) {
 const n=ctx.canvas.width;ctx.clearRect(0,0,n,n);ctx.fillStyle='#fff';ctx.fillRect(0,0,n,n);
 const side=Math.min(image.width,image.height);ctx.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,n,n);
 if(!sticker)return;
 const {x,y,width,height,angle,text}=sticker;ctx.save();ctx.translate(x*n,y*n);ctx.rotate(angle*Math.PI/180);
 ctx.fillStyle='#fff';ctx.fillRect(-width*n/2,-height*n/2,width*n,height*n);
 if(!blank){ctx.fillStyle='#111';let fontSize=height*n*.62;ctx.font=`900 ${fontSize}px Arial`;fontSize*=Math.min(1,(width*n*.88)/Math.max(1,ctx.measureText(text).width));ctx.font=`900 ${fontSize}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,0,0);}
 ctx.restore();
}

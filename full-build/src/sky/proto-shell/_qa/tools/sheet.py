import sys,os,glob,re
from PIL import Image,ImageDraw,ImageFont
out=sys.argv[1]
try: font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
except: font=ImageFont.load_default()
for dev in sorted(os.listdir(out)):
    d=os.path.join(out,dev)
    if not os.path.isdir(d): continue
    for theme in ('night','red'):
        fs=sorted(glob.glob(os.path.join(d,theme+'-[0-9]*.png')))
        if not fs: continue
        ims=[];labels=[]
        for f in fs:
            im=Image.open(f).convert('RGB');ims.append(im)
            m=re.match(r'.*?-(\d\d)-(.*)\.png',os.path.basename(f));labels.append(m.group(1)+' '+m.group(2).replace('_',' '))
        H=360 if ims[0].width>ims[0].height else 520
        th=[im.resize((max(1,int(im.width*H/im.height)),H)) for im in ims]
        cols=6 if ims[0].width>ims[0].height else 8
        cw=max(t.width for t in th)+8;rows=(len(th)+cols-1)//cols
        sheet=Image.new('RGB',(cols*cw+8,rows*(H+26)+8),(14,14,14));dr=ImageDraw.Draw(sheet)
        for i,t in enumerate(th):
            x=8+(i%cols)*cw;y=8+(i//cols)*(H+26)
            sheet.paste(t,(x,y+20));dr.text((x,y+2),labels[i][:int(cw/7.3)],fill=(235,235,235) if 'FAIL' not in labels[i] else (255,90,90),font=font)
        sheet.save(os.path.join(out,f'sheet-{dev}-{theme}.png'))
print('sheets done')

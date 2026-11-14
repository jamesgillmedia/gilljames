# Desktop+phone review sheet with strong pick badges. tag kinds: LIKED/HERO (green), MAYBE (amber), other notes (blue)
LEG=' · GREEN = liked · YELLOW = maybe · BLUE = keep as visual · GREY = considered, still in play · RED = not picked, out · nothing locked'
from PIL import Image,ImageDraw,ImageFont
F='/usr/share/fonts/truetype/dejavu/'
COL={'HERO':(60,230,120),'LIKED':(60,230,120),'MAYBE':(255,200,40),'VISUAL':(90,180,255),'CONSIDERED':(150,155,168),'OUT':(200,70,70),'PROPOSED':(255,200,40)}
def sheet(dirp,keys,LB,out,title,tcol):
  DW,DH,PH=560,350,350;PW=int(PH*390/844);TW=DW+PW+30;cols=3;rows=(len(keys)+2)//3
  o=Image.new('RGB',(cols*TW+20,96+rows*(DH+78)),(8,8,12));d=ImageDraw.Draw(o)
  d.text((20,18),title,fill=tcol,font=ImageFont.truetype(F+'DejaVuSans-Bold.ttf',26))
  d.text((20,56),'Desktop 1440×900 left · iPhone 390×844 right (emulated)' + (LEG if 'equal' not in out else ' · all tiles equal · nothing locked'),fill=(190,190,190),font=ImageFont.truetype(F+'DejaVuSans.ttf',16))
  b=ImageFont.truetype(F+'DejaVuSans-Bold.ttf',18);s=ImageFont.truetype(F+'DejaVuSans.ttf',15);bf=ImageFont.truetype(F+'DejaVuSans-Bold.ttf',30)
  for i,k in enumerate(keys):
    x,y=12+(i%cols)*TW,96+(i//cols)*(DH+78)
    t,kind,note=LB[k]
    if kind:
      c=COL[kind];d.rectangle([x-7,y-7,x+DW+PW+13,y+DH+62],outline=c,width=7)
    o.paste(Image.open(f'{dirp}/{k}-d.png').convert('RGB').resize((DW,DH)),(x,y))
    o.paste(Image.open(f'{dirp}/{k}-p.png').convert('RGB').resize((PW,PH)),(x+DW+6,y))
    if kind:
      lab=('CONSIDERED · IN PLAY' if kind=='CONSIDERED' else 'NOT PICKED · OUT' if kind=='OUT' else 'MY PROPOSAL' if kind=='PROPOSED' else kind)+(' ★' if kind in('HERO','LIKED') else ' ?' if kind=='MAYBE' else '')
      w=d.textlength(lab,font=bf)+28;d.rounded_rectangle([x+10,y+10,x+10+w,y+56],radius=10,fill=c)
      d.text((x+24,y+14),lab,fill=(0,0,0),font=bf)
    d.text((x+2,y+DH+8),k+' · '+t,fill=(240,240,240),font=b)
    if note:d.text((x+2,y+DH+34),note,fill=COL.get(kind,(200,200,200)) if kind else (200,200,200),font=s)
  o.save(out,quality=86)

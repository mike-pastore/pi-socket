import unicornhat
import time
unicornhat.brightness(0.2)
r=94
g=41
b=41
for x in range (0,8):
	for y in range (0,8):
		unicornhat.set_pixel(x,y,r,g,b)
unicornhat.show()
time.sleep(10)

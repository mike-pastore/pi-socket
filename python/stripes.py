import unicornhat as UH
import time
r=94
g=41
b=41
sleepspeed=0.05
for y in range(8):
	if y % 2 == 0:
		for x in range(8):
			UH.set_pixel(x,y,r,g,b)
			UH.show()
			time.sleep(sleepspeed)
	else:
		for x in reversed(8):
			UH.set_pixel(x,y,r,g,b)
			UH.show()
			time.sleep(sleepseed)

time.sleep(2)
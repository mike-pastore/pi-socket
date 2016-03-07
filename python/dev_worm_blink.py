import unicornhat as UH
import time
import math
r=173
g=31
b=31
sleepspeed=0.05

for y in range(8):
	if (y % 2) == 0:
		for x in range(8):
			UH.set_pixel(x,y,r,g,b)
			UH.show()
			time.sleep(sleepspeed)
	else:
		for x in reversed(range(8)):
			UH.set_pixel(x,y,r,g,b)
			UH.show()
			time.sleep(sleepspeed)

startSleep = 2.5
expoSleep = startSleep
counter = 1

while (expoSleep > 0.001):

	time.sleep(expoSleep)

	UH.clear()

	for x in range (0,8):
		for y in range (0,8):
			UH.set_pixel(x,y,r,g,b)
	UH.show()
	print 'expoSleep is: ', expoSleep
	# exponential decay to decrease expoSleep
	expoSleep = startSleep * (0.5**counter)
	counter += 1
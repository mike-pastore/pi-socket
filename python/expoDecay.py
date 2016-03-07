import math
import time

# t: current time
# b: start value
# c: change in value
# d: duration

# linearTween = lambda t, b, c, d : c*t/d + b

# def easeOutExpo(t, b, c, d):
# 	return c * ( -math.pow( 2, -10 * t/d ) + 1 ) + b

expoSleep = 2.5
counter = 1

while (expoSleep > 0.001):
	time.sleep(expoSleep)
	print 'expoSleep is: ', expoSleep
	# exponential decay to decrease expoSleep
	expoSleep = 2.5 * (0.5**counter)
	counter += 1

print 'done'
import serial
ser = serial.Serial('/dev/ttyACM1', 9600)

r=0
g=0
b=0

ser.write('r,g,b')
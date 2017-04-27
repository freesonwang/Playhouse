filename =  raw_input("Enter file path\n").strip()
reference_filename = raw_input("Enter reference file path\n").strip()
key = raw_input("Enter tag name to change...\n").strip()

file = open(filename)
refr = open(reference_filename)

file_lines = file.read().split("\n")
refr_lines = refr.read().split("\n")

line_store = []

for line in refr_lines:
	words = line.split(" ")
	tag = words[0]
	if key == tag:
		line_store.append(line)

new_file = open("new.obj", "w")

i = 0

for line in file_lines:	
	words = line.split(" ")
	tag = words[0]
	
	if key == tag:
		new_file.write(line_store[i])
		new_file.write("\n")
		i = i + 1
	else:
		new_file.write(line)
		new_file.write("\n")



from os import path

print 'Create a mtl file from obj file.'
filename = raw_input('Enter file path:\n')

file = open(filename, 'r')
mtlfile = open('material.mtl', 'w')

for line in file:
	line = line.strip()
	words = line.split(' ')
	tag = words[0]
	if 'g' == tag:
		mtlfile.write('\n#' + line + '\n')
	if 'usemtl' == tag:
		mtl_name = words[1]
		mtlfile.write('newmtl ' + mtl_name + '\n')
		mtlfile.write('\tmap_Ka ' + mtl_name + '.png\n')



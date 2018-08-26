import './scss/main.scss'

const icons = [
	'#js',
	'#aws',
	'#html5',
	'#css3',
	'#jenkins',
	'#linux',
	'#sass',
	'#vuejs',
	'#node-js',
	'#docker',
	'#digital-ocean',
	'#font-awesome',
	'#git',
	'#github',
	'#gitlab',
	'#grunt',
	'#gulp',
	'#python',
	'#angular',
	'#codepen'
]

const maxvy = 10 // Max y-velocity
const size = 40 // Width and height of elements
const g = .1 // Gravity

const svg = document.querySelector('#falling-skills')
const vb = svg.getAttribute('viewBox').split(' ')

const getInitialPosition = () => {
	const r = Math.random()
	return {
		x: Math.random() * (vb[2] - size),
		y: -size,
		vx: 0,
		vy: r * maxvy,
		fill: `rgba(0, 0, 0, ${r * 0.3})`
	}
}

let items = icons.map(item => {
	// <image x="10" y="20" width="80" height="80" xlink:href="image.svg" />
	const { x, y, vx, vy, vr, fill } = getInitialPosition()
	const el = document.createElementNS('http://www.w3.org/2000/svg', 'use')
	el.setAttributeNS(null, 'x', x)
	el.setAttributeNS(null, 'y', y)
	el.setAttributeNS(null, 'width', size)
	el.setAttributeNS(null, 'height', size)
	el.setAttributeNS(null, 'fill', fill)
	el.setAttributeNS('http://www.w3.org/1999/xlink', 'href', item)
	svg.appendChild(el)
	return { el, x, y, vx, vy, vr, fill, a: 0 }
})

const update = function() {
	items.forEach(item => {
		// gravity only acts in the y direction, increasing the velocity down
		item.vy += g

		item.x += item.vx // we take the time to be 1
		item.y += item.vy // we take the time to be 1

		item.el.setAttributeNS(null, 'x', item.x)
		item.el.setAttributeNS(null, 'y', item.y)
		item.el.setAttributeNS(null, 'fill', item.fill)

		if (item.y >= vb[3]) {
			const { x, y, vx, vy, vr, fill } = getInitialPosition()
			item.x = x
			item.y = y
			item.vx = vx
			item.vy = vy
			item.fill = fill
		}
	})
	requestAnimationFrame(update)
}

update()

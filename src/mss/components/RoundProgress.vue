<style>
	.containter {
		display: block;
		position: relative;
		overflow: hidden
	}

	.containter.responsive {
		width: 100%;
		padding-bottom: 100%;
	}

	.containter.containter.responsive > svg {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}
</style>

<template>
	<div class="container" :class="{ responsive: responsive }" :style="containerStyle">
		<svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox">
			<circle fill="none" :cx="radius" :cy="radius" :r="radius - stroke / 2" :style="bgStyle" />
			<path fill="none" :style="pathStyle" :transform="pathTransform" :d="pathArc" />
		</svg>
	</div>
</template>

<script>
	import { RoundProgressEase } from './RoundProgressEase';
	const EasingFunctions = new RoundProgressEase();

	const DEGREE_IN_RADIANS = Math.PI / 180;
	const HAS_PERF =
		typeof window !== 'undefined' &&
		window.performance &&
		window.performance.now &&
		typeof window.performance.now() === 'number';

	export default {
		name: 'round-progress',
		props: {
			current: {
				type: Number,
				required: true,
				default: 0
			},
			max: {
				type: Number,
				required: true,
				default: 100
			},
			radius: {
				type: Number,
				required: false,
				default: 125
			},
			animation: {
				type: String,
				required: false,
				default: 'easeOutCubic'
			},
			animationDelay: {
				type: Number,
				required: false,
				default: null
			},
			duration: {
				type: Number,
				required: false,
				default: 500
			},
			stroke: {
				type: Number,
				required: false,
				default: 15
			},
			color: {
				type: String,
				required: false,
				default: '#45CCCE'
			},
			background: {
				type: String,
				required: false,
				default: '#EAEAEA'
			},
			responsive: {
				type: Boolean,
				required: false,
				default: false
			},
			clockwise: {
				type: Boolean,
				required: false,
				default: true
			},
			semicircle: {
				type: Boolean,
				required: false,
				default: false
			},
			rounded: {
				type: Boolean,
				required: false,
				default: false
			}
		},
		computed: {
			containerStyle() {
				return {
					width: this.responsive ? '' : this.diameter + 'px',
					height: this.elementHeight,
					paddingBottom: this.paddingBottom
				};
			},

			pathArc() {
				return getArc(this.ani.current, this.max, this.radius - this.stroke / 2, this.radius, this.semicircle);
			},

			pathTransform() {
				if (this.semicircle) {
					return this.clockwise
						? `translate(0, ${this.diameter}) rotate(-90)`
						: `translate(${this.diameter + ',' + this.diameter}) rotate(90) scale(-1, 1)`;
				} else if (!this.clockwise) {
					return `scale(-1, 1) translate(-${this.diameter} 0)`;
				}
			},

			pathStyle() {
				return {
					strokeWidth: this.stroke,
					stroke: this.color,
					strokeLinecap: this.rounded ? 'round' : ''
				};
			},

			bgStyle() {
				return {
					stroke: this.background,
					strokeWidth: this.stroke
				};
			},

			diameter() {
				return this.radius * 2;
			},

			elementHeight() {
				if (!this.responsive) {
					return (this.semicircle ? this.radius : this.diameter) + 'px';
				}
			},

			viewBox() {
				return `0 0 ${this.diameter} ${this.semicircle ? this.radius : this.diameter}`;
			},

			paddingBottom() {
				if (this.responsive) {
					return this.semicircle ? '50%' : '100%';
				}
			}

		},
		data: function () {
			return {
				ani: {
					current: 0,
					id: 0
				}
			};
		},
		watch: {
			current: function () {
				this.changeProgress();
			}
		},
		methods: {
			changeProgress(animate = true) {
				if (this.duration > 0 && animate) {
					this.animateChange(this.current);
				} else {
					this.ani.current = this.current;
				}
			},

			animateChange
		},

		created() {
			this.changeProgress(false);
		}
	};

	function animateChange(to) {
		const self = this;
		const from = self.ani.current;
		const delta = to - from;
		const duration = self.duration;
		const ease = EasingFunctions[self.animation];

		const id = ++self.ani.id;

		function start() {
			const startTime = getTimestamp();

			requestAnimationFrame(function animation() {
				let currentTime = Math.min(getTimestamp() - startTime, duration);
				self.ani.current = ease(currentTime, from, delta, duration);

				if (id === self.ani.id && currentTime < duration) {
					requestAnimationFrame(animation);
				}
			});
		}

		if (self.animationDelay > 0) {
			setTimeout(start, self.animationDelay);
		} else {
			start();
		}
	}

	/**
	 * Generates a timestamp.
	 * @return {number}
	 */
	function getTimestamp() {
		return HAS_PERF ? window.performance.now() : Date.now();
	}

	/**
	 * Generates the value for an SVG arc.
	 * @param  {number}  current       Current value.
	 * @param  {number}  total         Maximum value.
	 * @param  {number}  pathRadius    Radius of the SVG path.
	 * @param  {number}  elementRadius Radius of the SVG container.
	 * @param  {boolean=false} isSemicircle  Whether the element should be a semicircle.
	 * @return {string}
	 */
	function getArc(current, total, pathRadius, elementRadius, isSemicircle = false) {
		let value = Math.max(0, Math.min(current || 0, total));
		let maxAngle = isSemicircle ? 180 : 359.9999;
		let percentage = (value / total) * maxAngle;
		let start = _polarToCartesian(elementRadius, pathRadius, percentage);
		let end = _polarToCartesian(elementRadius, pathRadius, 0);
		let arcSweep = (percentage <= 180 ? 0 : 1);

		return `M ${start} A ${pathRadius} ${pathRadius} 0 ${arcSweep} 0 ${end}`;
	};

	/**
	 * Converts polar cooradinates to Cartesian.
	 * @param  {number} elementRadius  Radius of the wrapper element.
	 * @param  {number} pathRadius     Radius of the path being described.
	 * @param  {number} angleInDegrees Degree to be converted.
	 * @return {string}
	 */
	function _polarToCartesian(elementRadius, pathRadius, angleInDegrees) {
		let angleInRadians = (angleInDegrees - 90) * DEGREE_IN_RADIANS;
		let x = elementRadius + (pathRadius * Math.cos(angleInRadians));
		let y = elementRadius + (pathRadius * Math.sin(angleInRadians));

		return x + ' ' + y;
	}

</script>

<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Proposition from '$lib/components/prose/Proposition.svelte';
	import Proof from '$lib/components/prose/Proof.svelte';
	import Example from '$lib/components/prose/Example.svelte';
	import Intuition from '$lib/components/prose/Intuition.svelte';
	import KeyIdea from '$lib/components/prose/KeyIdea.svelte';
	import Warning from '$lib/components/prose/Warning.svelte';
	import Remark from '$lib/components/prose/Remark.svelte';
	import History from '$lib/components/prose/History.svelte';
	import Question from '$lib/components/prose/Question.svelte';
	import Notation from '$lib/components/prose/Notation.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';

	import TrianglePlayground from '$lib/figures/foundations/groups/TrianglePlayground.svelte';
	import ClockArithmetic from '$lib/figures/foundations/groups/ClockArithmetic.svelte';
	import AxiomChecker from '$lib/figures/foundations/groups/AxiomChecker.svelte';
	import GeneratorExplorer from '$lib/figures/foundations/groups/GeneratorExplorer.svelte';
	import HelixWrap from '$lib/figures/foundations/groups/HelixWrap.svelte';
	import HomomorphismLens from '$lib/figures/foundations/groups/HomomorphismLens.svelte';
	import RenamingIsomorphism from '$lib/figures/foundations/groups/RenamingIsomorphism.svelte';

	const reading = [
		{
			title: 'Abstract Algebra: Theory and Applications',
			author: 'Thomas W. Judson',
			url: 'https://judsonbooks.org/abstract-algebra-theory-and-applications/',
			note: 'A complete, free, open-source textbook (approved by the American Institute of Mathematics). Its chapters on groups, cyclic groups and isomorphisms go one step beyond this chapter, with many exercises.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'Visual Group Theory',
			author: 'Nathan Carter',
			note: 'A whole book (MAA, 2009) built on pictures: Cayley diagrams, multiplication tables and symmetry. The ideal companion if this chapter’s figures helped you.',
			kind: 'book' as const
		},
		{
			title: 'Group Explorer 3.0',
			author: 'Nathan Carter and contributors',
			url: 'https://nathancarter.github.io/group-explorer/',
			note: 'A free web app: every group up to order 20, with linked Cayley diagrams, tables and cycle graphs. Find D₃ (called S₃ there) and compare its table with ours.',
			kind: 'interactive' as const,
			free: true
		},
		{
			title: 'Group theory, abstraction, and the 196,883-dimensional monster',
			author: '3Blue1Brown (Grant Sanderson)',
			url: 'https://www.3blue1brown.com/lessons/groups-and-monsters/',
			note: 'A beautiful video essay on groups as collections of symmetries, from the rotations of a cube to the Monster.',
			kind: 'video' as const,
			free: true
		},
		{
			title: 'A Book of Abstract Algebra',
			author: 'Charles C. Pinter',
			note: 'A famously friendly classic (Dover, 2nd ed. 2010). Its early chapters on groups, subgroups and homomorphisms are written for exactly the reader of this book.',
			kind: 'book' as const
		},
		{
			title: 'Expository papers (“blurbs”) on group theory',
			author: 'Keith Conrad',
			url: 'https://kconrad.math.uconn.edu/blurbs/',
			note: 'Short, careful notes on single topics: cyclic groups, homomorphisms, orders of elements. Excellent for a second look at any idea from this chapter.',
			kind: 'notes' as const,
			free: true
		}
	];
</script>

<Epigraph author="Hermann Weyl" source="“Invariants” (1939)">In these days the angel of topology and the devil of abstract algebra fight for the soul of each individual mathematical domain.</Epigraph>

<p class="lead">
	Cut an equilateral triangle out of card and lay it back in the hole it came from. In how many ways can you pick it
	up and put it down so that it fits again? Now glance at a clock: nine o’clock plus five hours is two o’clock. One
	question is about shapes, the other about counting — and yet underneath both of them lie the same four simple
	rules. A collection of things obeying those rules is called a <em>group</em>, and groups are the raw material from
	which homology is built.
</p>

<p>
	This chapter starts with the two examples, the triangle and the clock, and lets you play with them until the common
	rules become obvious. Then we write the rules down, meet a gallery of groups (and of impostors), and learn the
	handful of ideas we will lean on for the rest of the book: <em>abelian</em> groups, <em>subgroups</em> and
	<em>generators</em>, and the structure-preserving maps called <em>homomorphisms</em>, with their
	<em>kernels</em> and <em>images</em>.
</p>

<Ahead>
	<p>
		Homology turns a shape into a list of groups. Its raw material will be <em>chains</em>: sums of the edges and
		triangles of a shape, such as “this edge plus that edge minus a third”, and chains form a group. The
		<em>boundary</em> operation will be a homomorphism; its <em>kernel</em> will be the <em>cycles</em> (the chains
		with no boundary) and its <em>image</em> will be the <em>boundaries</em>. Homology will then be a
		<em>quotient group</em>, cycles modulo boundaries — the subject of <Ref to="foundations/abelian-groups" />. Every
		technical word in this paragraph is born in this chapter or the next.
	</p>
</Ahead>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="symmetry">Symmetry: moves that change nothing</h2>

<p>
	Let us take the triangle seriously. Imagine an equilateral triangle cut from card, resting in a triangular slot. Close
	your eyes while a friend lifts it out and drops it back into the slot. When you open your eyes, can you tell whether
	anything happened? If the card is blank, you cannot: every corner looks like every other corner. That is what it
	means for a move to be a <dfn>symmetry</dfn> — it leaves the object looking exactly as it did before.
</p>

<p>
	To keep track of what your friend did, paint the corners and call them <span class="nw">\(A\),</span> \(B\) and <span class="nw">\(C\).</span> Now different moves
	leave visibly different pictures behind, and we can count them. Your friend can:
</p>

<ul>
	<li>do nothing at all — we call this move \(e\) (the letter is short for the German <em>Einheit</em>, “unit”);</li>
	<li>
		rotate the card by a third of a turn, \(120^\circ\) anticlockwise — we call this <span class="nw">\(r\);</span>
	</li>
	<li>rotate it by two thirds of a turn, \(240^\circ\) — which is the same as doing \(r\) twice, so we call it <span class="nw">\(r^2\);</span></li>
	<li>
		flip the card over, turning it about one of the three dashed mirror lines of the slot. Call the three flips
		<span class="nw">\(f_1\),</span> <span class="nw">\(f_2\),</span> <span class="nw">\(f_3\):</span> \(f_1\) turns the card about the vertical line through the top of the slot, \(f_2\)
		about the line through the bottom-left corner of the slot, and \(f_3\) about the line through the bottom-right
		corner.
	</li>
</ul>

<p>
	Notice one detail that will matter in a minute: the mirror lines belong to the <em>slot</em>, not to the card. When
	you do <span class="nw">\(f_1\),</span> you always turn the card about the vertical line, whichever painted corner happens to sit on top at
	that moment.
</p>

<p>
	Why exactly six moves? Because a move is completely decided by two pieces of information: where corner \(A\) ends up
	(three possible places) and whether the card ends up face up or face down (two possibilities). Once you know those,
	the positions of \(B\) and \(C\) are forced. Three times two is six. Try it for yourself:
</p>

<Figure size="wide" num="1.3.1" title="The six symmetries of a triangle" hint="Press the moves · tap a table cell to replay it">
	<TrianglePlayground />
	{#snippet caption()}
		Every move lands the card back in its slot, so every sequence of moves is again one of the six. Each time you press
		a move \(g\) while the card shows the net move <span class="nw">\(h\),</span> you discover one entry of the table: the result of “first
		<span class="nw">\(h\),</span> then <span class="nw">\(g\)”.</span> The arrow printed on the card reverses whenever the card is turned over. Find the two cells that
		show that \(r\) followed by \(f_1\) is <em>not</em> the same as \(f_1\) followed by <span class="nw">\(r\).</span>
	{/snippet}
</Figure>

<h3 id="composing">Doing one move after another</h3>

<p>
	The interesting thing about symmetries is that you can <em>combine</em> them. Do one move, then another: the card is
	still in its slot, so the combination is itself a symmetry — one of the same six. For example, if you first flip with
	\(f_1\) and then rotate with <span class="nw">\(r\),</span> the card ends up exactly as if you had done the single flip <span class="nw">\(f_3\).</span> You can check
	this in Figure 1.3.1: press <em>Reset</em>, then <span class="nw">\(f_1\),</span> then <span class="nw">\(r\),</span> and compare with <em>Reset</em> followed by
	<span class="nw">\(f_3\).</span>
</p>

<Notation title="Writing “first h, then g”">
	<p>
		We write <span class="nw">\(g \circ h\),</span> read <span class="nw">“\(g\)</span> after <span class="nw">\(h\)”,</span> for the move “first do <span class="nw">\(h\),</span> then do <span class="nw">\(g\)”.</span> Often we drop the
		little circle and write simply <span class="nw">\(gh\).</span> So the experiment above says
	</p>
	\[ r \circ f_1 = f_3, \qquad\text{or simply}\qquad r f_1 = f_3 . \]
	<p>
		Reading right to left may feel backwards, but it is the same convention as for composing functions in
		<Ref to="foundations/sets-and-functions" />: a move <em>is</em> a function — it sends each point of the slot to a
		new point — and \(r \circ f_1\) is literally the composite function, which applies \(f_1\) first.
	</p>
</Notation>

<p>Playing with the triangle for a few minutes reveals five facts. Keep them in mind; they are the whole chapter in miniature.</p>

<ol>
	<li><strong>Combining stays inside.</strong> Doing two symmetries in a row gives a symmetry.</li>
	<li>
		<strong>There is a move that does nothing.</strong> Doing \(e\) before or after any move \(g\) changes nothing:
		<span class="nw">\(e \circ g = g \circ e = g\).</span>
	</li>
	<li>
		<strong>Every move can be undone.</strong> The rotation \(r\) is undone by \(r^2\) (a third of a turn plus two
		thirds is a full turn, which is the same as doing nothing): <span class="nw">\(r^2 \circ r = e\).</span> Each flip undoes itself: turning
		the card over twice about the same line returns it to where it was, so <span class="nw">\(f_1 \circ f_1 = e\).</span>
	</li>
	<li>
		<strong>Brackets do not matter.</strong> If you do three moves <span class="nw">\(f\),</span> then <span class="nw">\(g\),</span> then <span class="nw">\(h\),</span> it makes no
		difference whether you first combine \(f\) and \(g\) into one move, or \(g\) and <span class="nw">\(h\):</span> in symbols,
		<span class="nw">\((h \circ g) \circ f = h \circ (g \circ f)\).</span> Both sides simply mean <span class="nw">“\(f\),</span> then <span class="nw">\(g\),</span> then <span class="nw">\(h\)”.</span>
	</li>
	<li>
		<strong>But the order can matter.</strong> First \(f_1\) then \(r\) gives <span class="nw">\(f_3\);</span> first \(r\) then \(f_1\) gives
		<span class="nw">\(f_2\).</span> In symbols, \(r f_1 = f_3\) but <span class="nw">\(f_1 r = f_2\).</span>
	</li>
</ol>

<Question title="Why should the order matter?">
	<p>
		Before reading on, use the playground to compare \(r f_1\) with <span class="nw">\(f_1 r\),</span> and try to explain the difference in
		words. Hint: watch the arrow printed on the card. A flip reverses the direction of the arrow, so a flip turns an
		anticlockwise rotation into a clockwise one.
	</p>
</Question>

<p>
	Here is one way to see it. Rotating and then flipping is like walking forward and then turning left; flipping and
	then rotating is like turning left and then walking forward. Both sequences use the same two actions, but you end up
	in different places. In everyday life, “first put on your socks, then your shoes” is famously different from the
	opposite order. Order mattering is perfectly natural; it is the triangle’s way of telling us that symmetries are a
	richer kind of arithmetic than the arithmetic of numbers.
</p>

<p>
	One more observation, which will come back much later in the book: the rotations keep the card <em>face up</em> and
	the arrow on it turning anticlockwise, while the flips turn the card <em>face down</em> and reverse the arrow. The idea
	of a consistent “direction of turning” is called <em>orientation</em>, and it is exactly what homology uses to tell a
	torus from a Klein bottle (<Ref to="topology/manifolds" />, <Ref to="homology/computing" />).
</p>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="clock">Counting in circles: clock arithmetic</h2>

<p>
	Our second example comes from counting rather than from shapes. If it is 9 o’clock now, what time will it be in 5
	hours? Not 14 o’clock — on an ordinary clock the hand goes past 12 and starts again, so the answer is 2 o’clock. We
	have just computed <span class="nw">“\(9 + 5 = 2\)”,</span> which is perfectly correct on a clock.
</p>

<p>
	Mathematicians make two small changes to the clock. First, they write \(0\) at the top instead of \(12\) — on a clock,
	12 o’clock and 0 o’clock are the same position, and \(0\) is the more natural name, as we will see. Second, they
	allow any number of hours, not just twelve. A clock with \(n\) hours has the positions
	\[ 0,\ 1,\ 2,\ \dots,\ n-1 , \]
	and we add two positions by walking around the clock: start at <span class="nw">\(0\),</span> walk \(a\) steps, then walk \(b\) more steps.
	In practice: add the two numbers as usual, and if the answer is \(n\) or more, subtract <span class="nw">\(n\).</span> (When adding more than
	two numbers, keep subtracting \(n\) until you land among <span class="nw">\(0, \dots, n-1\);</span> in other words, take the remainder after
	dividing by <span class="nw">\(n\).)</span>
</p>

<Definition id="def-zn">
	{#snippet head()}Clock arithmetic \(\Z/n\){/snippet}
	<p>
		For a whole number <span class="nw">\(n \ge 1\),</span> \(\Z/n\) (read “zed mod <span class="nw">\(n\)”,</span> or “the integers mod <span class="nw">\(n\)”)</span> is the set
		\(\{0, 1, \dots, n-1\}\) with the addition of an \(n\)-hour clock: \(a + b\) is the remainder of the ordinary sum
		when divided by <span class="nw">\(n\).</span>
	</p>
</Definition>

<p>
	The symbol \(\Z\) (a blackboard-bold Z, from the German <em>Zahlen</em>, “numbers”) stands for the
	<dfn>integers</dfn>: the whole numbers \(0, 1, 2, \dots\) together with their negatives <span class="nw">\(-1, -2, \dots\).</span> The notation
	\(\Z/n\) is a reminder of where clock arithmetic comes from: the integers, with every multiple of \(n\) declared to be
	equal to <span class="nw">\(0\).</span> You met this idea in <Ref to="foundations/equivalence" />, where
	\(\Z/n\) appeared as a set of <Term t="equivalence-class">equivalence classes</Term> — the hours “1 o’clock”, “13
	o’clock” and “25 o’clock” are all the same class. Here we are adding those classes.
</p>

<Remark title="An honest word about the elements of ℤ/n">
	<p>
		Strictly speaking, the elements of \(\Z/n\) are classes of integers, and \(0, 1, \dots, n-1\) are just convenient
		<em>names</em> for them (one representative from each class). Adding by adding the names and then wrapping around is
		safe — the answer does not depend on which names you pick — but that needs an argument, which we give carefully in
		<Ref to="foundations/abelian-groups" />. For this chapter you can picture \(\Z/n\) simply as the \(n\) positions on a
		clock face.
	</p>
</Remark>

<Figure size="wide" num="1.3.2" title="Clock arithmetic" hint="Drag the sliders · tap a cell of the table">
	<ClockArithmetic />
	{#snippet caption()}
		The gold arc walks \(a\) steps, the teal arc \(b\) more; when the walk passes \(0\) it simply keeps going round. In
		the addition table every value has its own colour. Notice the diagonal stripes, and notice that every row and every
		column contains every colour exactly once. Switch on <em>show inverses</em>: each number is joined to the number
		that cancels it.
	{/snippet}
</Figure>

<p>Look at the five facts from the triangle again. Four of them hold on the clock too:</p>

<ol>
	<li><strong>Adding stays on the clock.</strong> The sum of two positions is a position.</li>
	<li><strong>There is a number that does nothing:</strong> <span class="nw">\(a + 0 = 0 + a = a\).</span></li>
	<li>
		<strong>Every step can be undone.</strong> Walking \(a\) steps is undone by walking \(n - a\) more, because
		<span class="nw">\(a + (n - a) = n\),</span> which is \(0\) on the clock. On a 12-hour clock, <span class="nw">\(7 + 5 = 0\),</span> so the number that undoes
		\(7\) is <span class="nw">\(5\).</span> We write it as <span class="nw">\(-7\):</span> on this clock, <span class="nw">\(-7 = 5\).</span>
	</li>
	<li>
		<strong>Brackets do not matter:</strong> <span class="nw">\((a + b) + c = a + (b + c)\),</span> because both are “walk <span class="nw">\(a\),</span> then <span class="nw">\(b\),</span>
		then <span class="nw">\(c\)”.</span>
	</li>
</ol>

<p>
	The fifth fact is different: on a clock, the order <em>never</em> matters, since walking \(a\) and then \(b\) steps
	gets you to the same place as walking \(b\) and then <span class="nw">\(a\).</span> In the table this shows up as a mirror symmetry across the
	diagonal.
</p>

<p>
	The smallest interesting clock, <span class="nw">\(\Z/2\),</span> deserves a special mention. It has just two positions, \(0\) and <span class="nw">\(1\),</span> and
	the one surprising rule <span class="nw">\(1 + 1 = 0\).</span> It is the arithmetic of <em>even</em> and <em>odd</em>: read \(0\) as “even”
	and \(1\) as “odd”, and the rules <span class="nw">\(0 + 0 = 0\),</span> <span class="nw">\(0 + 1 = 1\),</span> \(1 + 1 = 0\) say “even plus even is even, even plus
	odd is odd, odd plus odd is even”. You will also see \(\Z/2\) written \(\mathbb F_2\) (“the field with two elements”).
	It is the first number system homology will use (<Ref to="homology/chains" />), precisely because in it \(1 = -1\) and
	every question of sign disappears.
</p>

<p>
	Finally, notice that the three rotations of the triangle behave exactly like <span class="nw">\(\Z/3\).</span> Rotating by \(a\) thirds of a
	turn and then by \(b\) more thirds is rotating by \(a + b\) thirds, wrapping past a full turn: <span class="nw">\(r^a \circ r^b =
	r^{a+b}\),</span> with the exponent computed on a 3-hour clock. For instance <span class="nw">\(r^2 \circ r^2 = r^4 = r^1\).</span> Two worlds, one
	structure: that is what the next section is about.
</p>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="axioms">The rules of the game: what a group is</h2>

<p>
	We have seen two very different worlds — moves of a card, positions on a clock — obeying the same four rules. The
	great trick of modern mathematics is to stop asking <em>what</em> the things are and to keep only the rules they obey.
	Whatever we then prove from the rules alone will be true in every world that obeys them, at once.
</p>

<Definition id="def-group" title="Group">
	<p>
		A <dfn>group</dfn> is a set \(G\) together with an operation \(*\) that combines any two elements \(a, b\) of <span class="nw">\(G\),</span>
		in that order, into an element <span class="nw">\(a * b\),</span> such that the following four rules hold.
	</p>
	<ol>
		<li>
			<strong>Closure.</strong> For all \(a, b\) in <span class="nw">\(G\),</span> the combination \(a * b\) is again in <span class="nw">\(G\).</span>
		</li>
		<li>
			<strong>Associativity.</strong> For all \(a, b, c\) in <span class="nw">\(G\):</span> <span class="nw">\((a * b) * c = a * (b * c)\).</span>
		</li>
		<li>
			<strong>Identity.</strong> There is an element \(e\) in <span class="nw">\(G\),</span> called the <dfn>identity element</dfn>, such that
			\(e * a = a\) and \(a * e = a\) for every \(a\) in <span class="nw">\(G\).</span>
		</li>
		<li>
			<strong>Inverses.</strong> For every \(a\) in \(G\) there is an element \(a^{-1}\) in <span class="nw">\(G\),</span> called the
			<dfn>inverse</dfn> of <span class="nw">\(a\),</span> such that \(a * a^{-1} = e\) and <span class="nw">\(a^{-1} * a = e\).</span>
		</li>
	</ol>
</Definition>

<p>Let us read this slowly, symbol by symbol.</p>

<ul>
	<li>
		The star \(*\) (read “star”) is a placeholder. In a particular group it might be <span class="nw">\(+\),</span> or <span class="nw">\(\times\),</span> or
		<span class="nw">\(\circ\).</span> A rule that combines two elements into one like this is called a <dfn>binary operation</dfn>.
	</li>
	<li>
		<span class="nw">“\(a\)</span> in <span class="nw">\(G\)”</span> is often written <span class="nw">\(a \in G\),</span> read <span class="nw">“\(a\)</span> is an element of <span class="nw">\(G\)”,</span> as in
		<Ref to="foundations/sets-and-functions" />.
	</li>
	<li>
		<strong>Closure</strong> says the operation never throws you out of the set. (Many books build this into the word
		“operation” and do not list it separately. We list it because it is the first thing to check, and it is often the
		first thing to fail.)
	</li>
	<li>
		<strong>Associativity</strong> says that when you combine three elements, it does not matter which two you combine
		first. This is what allows us to write <span class="nw">\(a * b * c\),</span> or <span class="nw">\(abc\),</span> with no brackets at all. It is not automatic:
		subtraction of numbers is <em>not</em> associative, since \((5 - 3) - 1 = 1\) but <span class="nw">\(5 - (3 - 1) = 3\).</span>
	</li>
	<li>
		The <strong>identity</strong> is the element that does nothing — the move <span class="nw">\(e\),</span> the number \(0\) on the clock.
	</li>
	<li>
		\(a^{-1}\) is read <span class="nw">“\(a\)</span> inverse”. It is just a name for the element that undoes <span class="nw">\(a\);</span> it does <em>not</em> mean
		\(1/a\) unless the operation happens to be multiplication of numbers.
	</li>
</ul>

<Intuition title="A job description, not a list of ingredients">
	<p>
		The definition never says what the elements of a group <em>are</em>. They could be moves, numbers, colours, or
		beer mugs. David Hilbert, one of the founders of this way of thinking, is reported (by his student Otto Blumenthal)
		to have said of geometry that “one must always be able to say, instead of ‘points, straight lines, and planes’,
		‘tables, chairs, and beer mugs’.” The axioms of a group are the same kind of thing: a job description. Anything
		that can perform the four roles — combine, combine without caring about brackets, contain a do-nothing element,
		allow undoing — is a group, and everything we prove about groups applies to it.
	</p>
</Intuition>

<p>
	Most of the time we write the operation as plain juxtaposition, \(ab\) instead of <span class="nw">\(a * b\),</span> and speak of “the group
	<span class="nw">\(G\)”</span> even though, strictly, the group is the set <em>together with</em> its operation. When the operation could be
	in doubt, we write the pair: \((\Z, +)\) is “the integers under addition”.
</p>

<h3 id="first-proofs">Your first proofs about groups</h3>

<p>
	Here is a first taste of how much follows from the four rules alone. The definition says there is <em>an</em>
	identity element and <em>an</em> inverse of each element. Could there be two different identities? Could an element
	have two different inverses? The rules say no.
</p>

<Proposition title="Identities and inverses are unique">
	<p>
		A group has only one identity element, and each element \(a\) has only one inverse.
	</p>
</Proposition>

<Proof>
	<p>
		Suppose \(e\) and \(e'\) (read “e prime”) are both identity elements. Combine them: <span class="nw">\(e e'\).</span> Because \(e\) is an
		identity, <span class="nw">\(e e' = e'\).</span> Because \(e'\) is an identity, <span class="nw">\(e e' = e\).</span> So <span class="nw">\(e = e e' = e'\):</span> they were the same
		element all along.
	</p>
	<p>
		Now suppose \(b\) and \(c\) are both inverses of <span class="nw">\(a\),</span> so \(ba = e\) and <span class="nw">\(ac = e\).</span> Then
		\[ b \;=\; b e \;=\; b (a c) \;=\; (b a) c \;=\; e c \;=\; c . \]
		Each step uses exactly one rule: the identity, then <span class="nw">\(ac = e\),</span> then associativity, then <span class="nw">\(ba = e\),</span> then the
		identity again. So <span class="nw">\(b = c\).</span>
	</p>
</Proof>

<p>
	Here is a second fact, which explains the experiment with the triangle. How do you undo “first <span class="nw">\(h\),</span> then <span class="nw">\(g\)”?</span>
	You must undo the <em>last</em> move first: undo <span class="nw">\(g\),</span> then undo <span class="nw">\(h\).</span> In symbols,
	\[ (gh)^{-1} = h^{-1} g^{-1} . \]
	To check it, combine: \((gh)(h^{-1}g^{-1}) = g(hh^{-1})g^{-1} = geg^{-1} = gg^{-1} = e\). This is often called the
	<em>socks-and-shoes rule</em>: you put on socks, then shoes, but you take off the shoes first.
</p>

<h3 id="cayley-tables">Cayley tables and the Sudoku property</h3>

<p>
	For a finite group we can write down the whole operation as a table, like the one you filled in for the triangle: the
	entry in row \(g\) and column \(h\) is <span class="nw">\(gh\).</span> Such a table is called a <dfn>Cayley table</dfn>. In both of our tables
	you may have noticed that <em>every element appears exactly once in every row and exactly once in every column</em>,
	like the digits of a Sudoku. That is not a coincidence.
</p>

<Proposition title="The cancellation law">
	<p>
		In a group, if \(ab = ac\) then <span class="nw">\(b = c\).</span> Likewise, if \(ba = ca\) then <span class="nw">\(b = c\).</span>
	</p>
</Proposition>

<Proof>
	<p>
		Multiply both sides of \(ab = ac\) on the left by <span class="nw">\(a^{-1}\):</span> <span class="nw">\(a^{-1}(ab) = a^{-1}(ac)\).</span> By associativity this is
		<span class="nw">\((a^{-1}a)b = (a^{-1}a)c\),</span> that is <span class="nw">\(eb = ec\),</span> that is <span class="nw">\(b = c\).</span> The second statement is proved the same way,
		multiplying on the right.
	</p>
</Proof>

<p>
	Now look at row \(a\) of a Cayley table: its entries are \(ab\) for the different elements <span class="nw">\(b\).</span> If two of them were
	equal, say \(ab = ac\) with <span class="nw">\(b \neq c\),</span> the cancellation law would be violated. So no element repeats in a row; and
	since a row of a table with \(n\) columns has \(n\) entries, each of the \(n\) elements appears exactly once. The same
	argument works for columns. A table with this property is called a <em>Latin square</em>.
</p>

<Warning title="The Sudoku property is necessary, not sufficient">
	<p>
		Every group table is a Latin square, but not every Latin square is a group table: a table can have the Sudoku
		property and still fail associativity. Associativity is a genuinely separate condition, and checking it means
		checking every triple of elements.
	</p>
</Warning>

<History title="Galois and Cayley">
	<p>
		The word “group” (<em>groupe</em>) was first used in this sense by Évariste Galois, who used groups of permutations
		to decide which polynomial equations can be solved by a formula. He died after a duel in May 1832, aged twenty;
		the night before, he wrote a letter to his friend Auguste Chevalier summarizing his discoveries. The first abstract
		definition of a group — a set of symbols with a combining rule, displayed as a table — was given by Arthur Cayley
		in 1854, which is why such tables now carry his name.
	</p>
</History>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="examples">A gallery of groups — and some impostors</h2>

<p>
	The best way to understand a definition is to collect examples of things that satisfy it, and of things that almost
	do. Here are the groups we will meet again and again.
</p>

<ul>
	<li>
		<strong>\((\Z, +)\)</strong>, the integers under addition. The identity is <span class="nw">\(0\);</span> the inverse of \(a\) is <span class="nw">\(-a\).</span>
		This is the most important group in this book.
	</li>
	<li>
		<strong>\((\Z/n, +)\)</strong>, clock arithmetic with \(n\) hours. The identity is <span class="nw">\(0\);</span> the inverse of \(a\) is
		\(n - a\) (and \(0\) is its own inverse).
	</li>
	<li>
		<strong>\((\R, +)\)</strong>, the real numbers — all the points of the number line, including fractions and numbers
		like \(\sqrt 2\) and \(\pi\) — under addition.
	</li>
	<li>
		<strong>\((\R \setminus \{0\}, \times)\)</strong>, the nonzero real numbers under multiplication. (The symbol
		\(\setminus\) means “remove”: \(\R \setminus \{0\}\) is “the real numbers with \(0\) removed”.) Here the identity
		is <span class="nw">\(1\),</span> and the inverse of \(a\) is <span class="nw">\(1/a\).</span>
	</li>
	<li>
		<strong>\((\{+1, -1\}, \times)\)</strong>, the two signs under multiplication: <span class="nw">\((-1)\times(-1) = +1\).</span>
	</li>
	<li>
		<strong>\(D_3\)</strong>, the six symmetries of the triangle, under composition. The name means “dihedral group”:
		<em>di-hedral</em>, “two faces”, because a flip shows the other face of the card.
	</li>
	<li>
		<strong>The rotations of a square</strong>, <span class="nw">\(\{e, \rho, \rho^2, \rho^3\}\),</span> where \(\rho\) (the Greek letter rho)
		is a quarter turn.
	</li>
	<li>
		<strong>The symmetries of a rectangle</strong> that is not a square: do nothing <span class="nw">(\(e\)),</span> flip top-to-bottom
		<span class="nw">(\(h\),</span> turning about the horizontal axis), flip left-to-right <span class="nw">(\(v\),</span> about the vertical axis), and a half turn
		<span class="nw">(\(t\)).</span>
	</li>
	<li>
		<strong>The <dfn>trivial group</dfn></strong> <span class="nw">\(\{0\}\),</span> with a single element and the only possible rule
		<span class="nw">\(0 + 0 = 0\).</span> It is the smallest group there is, and it will be the answer to many homology questions
		(“no holes here”), so it is usually written simply <span class="nw">\(0\).</span>
	</li>
</ul>

<p>
	The number of elements of a group \(G\) is called its <dfn>order</dfn> and written <span class="nw">\(|G|\).</span> So <span class="nw">\(|D_3| = 6\),</span>
	<span class="nw">\(|\Z/n| = n\),</span> and \(\Z\) and \(\R\) have infinite order.
</p>

<p>
	And here are some impostors — pairs of a set and an operation that fail at least one rule. Each failure teaches
	something.
</p>

<ul>
	<li>
		<strong>\((\N, +)\)</strong>, the natural numbers \(0, 1, 2, \dots\) under addition, has closure, associativity and
		an identity, but no inverses: there is no natural number \(x\) with <span class="nw">\(3 + x = 0\).</span> You can count up, but never undo.
	</li>
	<li>
		<strong>\((\Z, -)\)</strong>, the integers under subtraction, is not associative, and has no element that does
		nothing on both sides <span class="nw">(\(a - 0 = a\),</span> but <span class="nw">\(0 - a = -a\)).</span>
	</li>
	<li>
		<strong>\((\R, \times)\)</strong> fails only because of one element: \(0\) has no inverse, since \(0 \times x = 0\)
		is never <span class="nw">\(1\).</span> Remove \(0\) and you get a group.
	</li>
	<li>
		<strong>The odd integers under addition</strong> are not even closed: \(3 + 5 = 8\) is even.
	</li>
	<li>
		<strong>\((\Z/6 \setminus \{0\}, \times)\)</strong>, the nonzero numbers on a 6-hour clock under clock
		multiplication, is not closed either: <span class="nw">\(2 \times 3 = 6 = 0\),</span> which has been removed. Strangely,
		\((\Z/5 \setminus \{0\}, \times)\) <em>is</em> a group. The difference is that \(5\) is prime and \(6\) is not.
	</li>
</ul>

<Figure size="wide" num="1.3.3" title="Group or impostor?" hint="Pick a candidate · predict · tap to check">
	<AxiomChecker />
	{#snippet caption()}
		For each candidate, guess which of the four rules hold before you tap them. Then use the test bench to try the
		operation on elements of your choice: hunt for a pair whose combination leaves the set, a triple where the brackets
		matter, and a pair where the order matters. Only a candidate that passes all four checks is a group.
	{/snippet}
</Figure>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="abelian">When order doesn’t matter: abelian groups</h2>

<p>
	The clock and the triangle differ in one important respect: on the clock the order of addition never matters, while
	for the triangle it sometimes does. Groups of the first kind have a name.
</p>

<Definition id="def-abelian" title="Abelian group">
	<p>
		A group \(G\) is <dfn>abelian</dfn> (or <em>commutative</em>) if \(ab = ba\) for <em>all</em> elements \(a\) and
		\(b\) of <span class="nw">\(G\).</span>
	</p>
</Definition>

<p>
	The word honours the Norwegian mathematician Niels Henrik Abel (1802–1829), who, like Galois, died young and changed
	the theory of equations. Abelian groups are so common that the word is usually written with a lower-case “a”.
</p>

<p>
	Most of our examples are abelian: <span class="nw">\(\Z\),</span> <span class="nw">\(\Z/n\),</span> <span class="nw">\(\R\),</span> <span class="nw">\(\R \setminus \{0\}\),</span> the two signs, the rotations of a
	square, the symmetries of a rectangle. The triangle group \(D_3\) is not: \(r f_1 = f_3\) but <span class="nw">\(f_1 r = f_2\).</span> One
	way to see why is to follow the arrow on the card. A flip reverses the arrow, so “flip, rotate anticlockwise, flip
	back” is the same as rotating <em>clockwise</em>:
	\[ f_1 \, r \, f_1 = r^2 = r^{-1} . \]
	If \(D_3\) were abelian, the left side would simplify to <span class="nw">\(f_1 f_1 r = r\),</span> and we would get <span class="nw">\(r = r^{-1}\),</span> which is
	false. In fact \(D_3\) is the smallest non-abelian group: every group with five or fewer elements is abelian.
</p>

<Warning title="“Abelian” is about every pair">
	<p>
		Some pairs of elements of \(D_3\) do commute — \(r\) and <span class="nw">\(r^2\),</span> for instance, or \(e\) and anything. That does not
		make \(D_3\) abelian. The definition asks for \(ab = ba\) for <em>all</em> pairs, and one failing pair is enough to
		spoil it.
	</p>
</Warning>

<h3 id="additive-notation">Additive notation</h3>

<p>
	For abelian groups there is a special, very convenient way of writing. Since the operation behaves like addition, we
	write it as addition.
</p>

<Notation title="Additive notation for abelian groups">
	<div class="table-wrap">
		<table>
			<thead>
				<tr><th>In a general group</th><th>In an abelian group, written additively</th><th>Read</th></tr>
			</thead>
			<tbody>
				<tr><td>\(ab\)</td><td>\(a + b\)</td><td>“a plus b”</td></tr>
				<tr><td>\(e\)</td><td>\(0\)</td><td>“zero”</td></tr>
				<tr><td>\(a^{-1}\)</td><td>\(-a\)</td><td>“minus a”</td></tr>
				<tr><td>\(ab^{-1}\)</td><td>\(a - b\)</td><td>“a minus b”</td></tr>
				<tr><td>\(a^k = a a \cdots a\)</td><td>\(ka = a + a + \dots + a\)</td><td>“k times a”</td></tr>
			</tbody>
		</table>
	</div>
	<p>
		We use \(+\) <em>only</em> for abelian groups. Seeing a plus sign is a promise that the order of the terms does not
		matter, so <span class="nw">\(a + b - c = -c + b + a\).</span>
	</p>
</Notation>

<p>
	Be careful with the expression <span class="nw">\(ka\):</span> here \(k\) is an ordinary integer (how many copies of \(a\) to add), while
	\(a\) is an element of the group. For negative \(k\) it means adding copies of <span class="nw">\(-a\):</span> <span class="nw">\((-3)a = -a - a - a\).</span> In
	<span class="nw">\(\Z/12\),</span> for example, <span class="nw">\(5 \cdot 7 = 7 + 7 + 7 + 7 + 7 = 35 = 11\).</span>
</p>

<KeyIdea title="Homology lives in the abelian world">
	<p>
		Homology combines the pieces of a shape the way a shopkeeper combines stock: “two of this edge, minus one of that
		edge”. In an inventory, the order of the items never matters. So every group that homology produces is abelian,
		and from the next chapter on almost all our groups will be abelian and written additively.
	</p>
	<p>
		Non-abelian groups will appear in this book mainly once more, as the <em>fundamental group</em> of a shape in
		<Ref to="topology/homotopy" />, which records how loops can be combined. For a figure-eight that group is not
		abelian, and one of the first theorems about homology (<Ref to="homology/invariance" />) says that the first
		homology group is exactly “the fundamental group made abelian”.
	</p>
</KeyIdea>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="subgroups">Groups inside groups</h2>

<p>
	Inside the six symmetries of the triangle sit the three rotations <span class="nw">\(\{e, r, r^2\}\).</span> They form a little group of
	their own: combining two rotations gives a rotation, the do-nothing move is a rotation (by <span class="nw">\(0^\circ\)),</span> and the
	inverse of a rotation is a rotation. A group living inside a bigger group like this is called a subgroup.
</p>

<Definition id="def-subgroup" title="Subgroup">
	<p>
		A subset \(H\) of a group \(G\) is a <dfn>subgroup</dfn>, written \(H \le G\) (read <span class="nw">“\(H\)</span> is a subgroup of
		<span class="nw">\(G\)”),</span> if it is a group with the same operation. To check this, it is enough to check three things:
	</p>
	<ol>
		<li>\(H\) contains the identity of <span class="nw">\(G\);</span></li>
		<li>\(H\) is closed under the operation: if \(a, b \in H\) then <span class="nw">\(ab \in H\);</span></li>
		<li>\(H\) is closed under inverses: if \(a \in H\) then <span class="nw">\(a^{-1} \in H\).</span></li>
	</ol>
</Definition>

<p>
	(Associativity never needs checking for a subgroup: it holds for all elements of <span class="nw">\(G\),</span> so in particular for those of
	<span class="nw">\(H\).)</span> Some examples, in additive notation where the group is abelian:
</p>

<ul>
	<li>
		The <strong>even integers</strong> \(\{\dots, -4, -2, 0, 2, 4, \dots\}\) form a subgroup of <span class="nw">\(\Z\),</span> written <span class="nw">\(2\Z\):</span>
		\(0\) is even, the sum of two even numbers is even, and the negative of an even number is even.
	</li>
	<li>
		More generally, the multiples of any fixed number <span class="nw">\(n\),</span> <span class="nw">\(n\Z = \{\dots, -2n, -n, 0, n, 2n, \dots\}\),</span> form a
		subgroup of <span class="nw">\(\Z\).</span>
	</li>
	<li>\(\{0, 2, 4\}\) is a subgroup of <span class="nw">\(\Z/6\),</span> and so is \(\{0, 3\}\) (on a 6-hour clock, <span class="nw">\(3 + 3 = 0\)).</span></li>
	<li>
		In <span class="nw">\(D_3\):</span> the rotations <span class="nw">\(\{e, r, r^2\}\),</span> and also each <span class="nw">\(\{e, f_1\}\),</span> <span class="nw">\(\{e, f_2\}\),</span> <span class="nw">\(\{e, f_3\}\).</span>
	</li>
	<li>Every group has two boring subgroups: the trivial subgroup \(\{e\}\) and the whole group <span class="nw">\(G\).</span></li>
</ul>

<p>And some subsets that are <em>not</em> subgroups:</p>

<ul>
	<li>The odd integers: they do not contain \(0\) (and are not closed).</li>
	<li>The natural numbers inside <span class="nw">\(\Z\):</span> they contain \(0\) and are closed, but \(3\) has no inverse among them.</li>
	<li>\(\{0, 1, 2\}\) inside <span class="nw">\(\Z/6\):</span> \(1 + 2 = 3\) is missing.</li>
</ul>

<Warning title="ℤ/n is not a subgroup of ℤ">
	<p>
		It is tempting to think of \(\Z/n\) as the numbers \(\{0, 1, \dots, n-1\}\) sitting inside <span class="nw">\(\Z\).</span> But that set is
		not a subgroup of <span class="nw">\(\Z\):</span> in <span class="nw">\(\Z\),</span> <span class="nw">\(1 + (n-1) = n\),</span> which is not in the set. Clock arithmetic is not a piece of
		integer arithmetic; it is integer arithmetic <em>with some things declared equal</em>. That process — building a new
		group by collapsing, rather than by cutting out a piece — is the subject of the next chapter.
	</p>
</Warning>

<h3 id="generators">Generators and cyclic groups</h3>

<p>
	Pick an element \(a\) of an abelian group and ask: what is the smallest subgroup that contains it? It must contain
	<span class="nw">\(a + a = 2a\),</span> and <span class="nw">\(3a\),</span> and so on; it must contain <span class="nw">\(0\),</span> and <span class="nw">\(-a\),</span> <span class="nw">\(-2a\),</span> and so on. And the collection of all
	these multiples is already a subgroup (the sum of two multiples of \(a\) is a multiple of <span class="nw">\(a\)).</span> So the answer is
	\[ \langle a \rangle = \{\, ka \;:\; k \in \Z \,\} = \{\dots, -2a, -a, 0, a, 2a, 3a, \dots\} , \]
	read “the subgroup generated by <span class="nw">\(a\)”.</span> (In multiplicative notation it consists of the powers <span class="nw">\(a^k\).)</span> The colon
	inside the braces is read “such that” or “where”: “all <span class="nw">\(ka\),</span> where \(k\) is an integer”.
</p>

<Definition title="Generators and cyclic groups">
	<p>
		A group \(G\) is <dfn>cyclic</dfn> if \(G = \langle a \rangle\) for some element <span class="nw">\(a\);</span> such an \(a\) is called a
		<dfn>generator</dfn> of <span class="nw">\(G\).</span> More generally, a set of elements <em>generates</em> \(G\) if every element of \(G\)
		can be built from them using the operation and inverses.
	</p>
</Definition>

<p>
	\(\Z\) is cyclic: every integer is a multiple of <span class="nw">\(1\),</span> so <span class="nw">\(\Z = \langle 1 \rangle\).</span> (It is also
	<span class="nw">\(\langle -1 \rangle\),</span> but not <span class="nw">\(\langle 2 \rangle\),</span> which is only the even numbers.) Every clock \(\Z/n\) is cyclic,
	generated by <span class="nw">\(1\):</span> every position is reached by repeatedly stepping one hour. The rotations of the triangle are
	cyclic, generated by <span class="nw">\(r\).</span>
</p>

<p>
	\(D_3\) is not cyclic. A rotation generates only the rotations, and a flip \(f\) generates only <span class="nw">\(\{e, f\}\).</span> But two
	elements suffice: using the products you found in Figure 1.3.1, \(r f_1 = f_3\) and <span class="nw">\(r^2 f_1 = f_2\),</span> so
	\[ D_3 = \{\, e,\ r,\ r^2,\ f_1,\ r f_1,\ r^2 f_1 \,\} \]
	is generated by \(r\) and <span class="nw">\(f_1\).</span>
</p>

<h3 id="order">The order of an element</h3>

<p>
	On a clock, keep adding the same number and you must eventually come back to <span class="nw">\(0\).</span> On a 12-hour clock, starting
	from \(0\) and adding \(3\) each time gives <span class="nw">\(3, 6, 9, 12 = 0\):</span> four steps. The number of steps it takes is an
	important number.
</p>

<Definition title="Order of an element">
	<p>
		The <dfn>order</dfn> of an element \(a\) is the smallest whole number \(k \ge 1\) with \(ka = 0\) (in
		multiplicative notation, <span class="nw">\(a^k = e\)).</span> If no such \(k\) exists, \(a\) has <em>infinite order</em>.
	</p>
</Definition>

<p>
	The order of \(a\) is exactly the number of elements of <span class="nw">\(\langle a \rangle\):</span> the walk \(0, a, 2a, \dots\) visits new
	elements until it first returns to <span class="nw">\(0\),</span> and then repeats. In <span class="nw">\(\Z\),</span> every element except \(0\) has infinite order —
	adding \(3\) to itself never gives <span class="nw">\(0\).</span> In <span class="nw">\(D_3\),</span> the flips have order \(2\) and <span class="nw">\(r\),</span> \(r^2\) have order <span class="nw">\(3\).</span>
</p>

<p>
	In \(\Z/n\) there is a neat formula. Write <span class="nw">\(\gcd(n, k)\),</span> the <dfn>greatest common divisor</dfn>, for the largest
	whole number that divides both \(n\) and <span class="nw">\(k\);</span> for example \(\gcd(12, 9) = 3\) and <span class="nw">\(\gcd(12, 5) = 1\).</span> Then the
	order of \(k\) in \(\Z/n\) is
	\[ \operatorname{order}(k) = \frac{n}{\gcd(n, k)} . \]
	(The walk \(0, k, 2k, \dots\) returns to \(0\) the first time it reaches a common multiple of \(k\) and <span class="nw">\(n\),</span> and the
	smallest such is <span class="nw">\(nk / \gcd(n,k)\),</span> reached after \(n/\gcd(n,k)\) steps.) In particular, \(k\) generates all of
	\(\Z/n\) exactly when <span class="nw">\(\gcd(n, k) = 1\).</span> On a 12-hour clock the generators are <span class="nw">\(1, 5, 7, 11\).</span>
</p>

<Figure size="wide" num="1.3.4" title="Walking around a clock" hint="Tap a dot to choose k · drag n">
	<GeneratorExplorer />
	{#snippet caption()}
		Starting at \(0\) and repeatedly adding \(k\) traces a star that closes up when it returns to <span class="nw">\(0\).</span> The dots it
		visits form the subgroup <span class="nw">\(\langle k \rangle\).</span> Which \(k\) visit every dot? What happens when \(n\) is prime? The
		chips list every subgroup of <span class="nw">\(\Z/n\):</span> there is exactly one for each divisor of <span class="nw">\(n\).</span>
	{/snippet}
</Figure>

<h3 id="subgroups-of-z">All the subgroups of the integers</h3>

<p>
	Here is a complete answer to a natural question, and it will be the starting point of the next chapter.
</p>

<Theorem title="Subgroups of ℤ">
	<p>Every subgroup of \(\Z\) is <span class="nw">\(n\Z\),</span> the multiples of some whole number <span class="nw">\(n \ge 0\).</span></p>
</Theorem>

<Proof>
	<p>
		Let \(H\) be a subgroup of <span class="nw">\(\Z\).</span> If <span class="nw">\(H = \{0\}\),</span> then \(H = 0\Z\) and we are done. Otherwise \(H\) contains a
		nonzero number, and then also its negative, so it contains a positive number. Let \(n\) be the
		<em>smallest</em> positive number in <span class="nw">\(H\).</span> We show <span class="nw">\(H = n\Z\).</span>
	</p>
	<p>
		First, all multiples of \(n\) are in <span class="nw">\(H\),</span> because \(H\) is a subgroup containing <span class="nw">\(n\).</span> Conversely, take any
		\(h \in H\) and divide it by \(n\) with remainder: \(h = qn + s\) with <span class="nw">\(0 \le s < n\).</span> Then \(s = h - qn\) is in
		\(H\) (a difference of elements of <span class="nw">\(H\)).</span> But \(s\) is smaller than <span class="nw">\(n\),</span> and \(n\) was the smallest positive
		element of <span class="nw">\(H\),</span> so \(s\) cannot be positive: <span class="nw">\(s = 0\).</span> Hence \(h = qn\) is a multiple of <span class="nw">\(n\).</span>
	</p>
</Proof>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="homomorphisms">Maps that respect the rules: homomorphisms</h2>

<p>
	Every integer is either even or odd, and there are well-known rules: even plus odd is odd, odd plus odd is even. The
	remarkable thing about these rules is that they work: to know whether \(a + b\) is even, you do not need to know
	\(a\) and \(b\) — only whether <em>they</em> are even. Write \(p(m)\) for the parity of <span class="nw">\(m\):</span> \(p(m) = 0\) if
	\(m\) is even and \(p(m) = 1\) if \(m\) is odd. Then the parity rules say
	\[ p(a + b) = p(a) + p(b) \qquad \text{for all integers } a, b, \]
	where the addition on the right is the addition of <span class="nw">\(\Z/2\).</span> The function \(p\colon \Z \to \Z/2\) translates the
	arithmetic of \(\Z\) faithfully into the arithmetic of <span class="nw">\(\Z/2\).</span> It loses a great deal of information — it forgets
	everything about a number except its parity — but what it keeps, it keeps correctly.
</p>

<p>
	The same is true of a clock. If \(c(m)\) is the clock reading after \(m\) hours, then <span class="nw">\(c(a + b) = c(a) + c(b)\):</span>
	waiting \(a\) hours and then \(b\) more moves the hand as the two waits combined. And it is true of the triangle: let
	\(s(g) = +1\) if the symmetry \(g\) leaves the card face up (a rotation), and \(s(g) = -1\) if it turns the card over
	(a flip). Turning the card over twice leaves it face up, so <span class="nw">\(s(gh) = s(g)\, s(h)\).</span> This function
	\(s\colon D_3 \to \{+1, -1\}\) is called the <dfn>sign</dfn>. In each case, combining and then translating gives the
	same answer as translating and then combining.
</p>

<Definition id="def-homomorphism" title="Homomorphism">
	<p>
		A <dfn>homomorphism</dfn> from a group \(G\) to a group \(H\) is a function \(\varphi\colon G \to H\) such that
		\[ \varphi(ab) = \varphi(a)\, \varphi(b) \qquad \text{for all } a, b \in G . \]
		For abelian groups written additively, the condition reads <span class="nw">\(\varphi(a + b) = \varphi(a) + \varphi(b)\).</span>
	</p>
</Definition>

<p>
	The Greek letter \(\varphi\) is read “phi” (rhymes with “fie”). The word comes from the Greek for “same shape”: a
	homomorphism carries the shape of the operation across. On the left of the equation we combine in \(G\) and then
	apply <span class="nw">\(\varphi\);</span> on the right we apply \(\varphi\) and then combine in <span class="nw">\(H\).</span> A homomorphism is a map for which the
	two routes agree.
</p>

<p>Two consequences follow immediately, and both are used constantly. In additive notation:</p>

<ul>
	<li>
		<strong><span class="nw">\(\varphi(0) = 0\).</span></strong> Indeed \(\varphi(0) = \varphi(0 + 0) = \varphi(0) + \varphi(0)\); subtracting
		\(\varphi(0)\) from both sides leaves <span class="nw">\(0 = \varphi(0)\).</span>
	</li>
	<li>
		<strong><span class="nw">\(\varphi(-a) = -\varphi(a)\).</span></strong> Indeed \(\varphi(a) + \varphi(-a) = \varphi(a + (-a)) =
		\varphi(0) = 0\), so \(\varphi(-a)\) is the inverse of <span class="nw">\(\varphi(a)\).</span>
	</li>
</ul>

<Example title="Homomorphisms and impostors">
	<ul>
		<li>
			Doubling, <span class="nw">\(x \mapsto 2x\),</span> is a homomorphism <span class="nw">\(\Z \to \Z\):</span> <span class="nw">\(2(a + b) = 2a + 2b\).</span> (The arrow \(\mapsto\) is
			read “goes to”.)
		</li>
		<li>
			Adding one, <span class="nw">\(x \mapsto x + 1\),</span> is <em>not</em>: it sends \(0\) to <span class="nw">\(1\),</span> and a homomorphism must send \(0\) to
			<span class="nw">\(0\).</span>
		</li>
		<li>
			Squaring, <span class="nw">\(x \mapsto x^2\),</span> is not a homomorphism <span class="nw">\((\Z, +) \to (\Z, +)\):</span> \((1 + 1)^2 = 4\) but
			<span class="nw">\(1^2 + 1^2 = 2\).</span>
		</li>
		<li>
			Reduction mod <span class="nw">\(n\),</span> <span class="nw">\(\Z \to \Z/n\),</span> sending each integer to its position on the \(n\)-hour clock, is a
			homomorphism. It is the subject of the next figure.
		</li>
	</ul>
</Example>

<Figure size="wide" num="1.3.5" title="Wrapping the integers around a clock" hint="Drag to rotate · change n">
	<HelixWrap />
	{#snippet caption()}
		The number line is coiled into a spring with \(n\) integers per turn; looking straight down, each integer lands on
		one of the \(n\) positions of the dial below. This is the homomorphism <span class="nw">\(\varphi\colon \Z \to \Z/n\).</span> The gold beads
		are everything that lands on \(0\) — the multiples of \(n\) — and they stack up in a single column. Choose a
		nonzero \(a\) to light up, in teal, the integers that land on <span class="nw">\(a\):</span> another column, the gold one shifted by <span class="nw">\(a\).</span>
	{/snippet}
</Figure>

<h3 id="kernel-image">Kernel and image</h3>

<p>
	Every homomorphism comes with two subgroups that describe it. Figure 1.3.5 shows both: the gold column is one, and
	the fact that every position of the dial is hit is the other.
</p>

<Definition title="Kernel and image">
	<p>Let \(\varphi\colon G \to H\) be a homomorphism of abelian groups.</p>
	<ul>
		<li>
			The <dfn>kernel</dfn> of \(\varphi\) is everything that \(\varphi\) sends to zero:
			\[ \ker\varphi = \{\, a \in G \;:\; \varphi(a) = 0 \,\} . \]
		</li>
		<li>
			The <dfn>image</dfn> of \(\varphi\) is everything that \(\varphi\) reaches:
			\[ \im\varphi = \{\, \varphi(a) \;:\; a \in G \,\} . \]
		</li>
	</ul>
</Definition>

<p>
	The kernel lives in the starting group <span class="nw">\(G\);</span> the image lives in the target <span class="nw">\(H\).</span> (The image is the same as the image
	of a function from <Ref to="foundations/sets-and-functions" />; the kernel is the <Term t="preimage">preimage</Term>
	of <span class="nw">\(0\).)</span> Let us compute them for our examples.
</p>

<ul>
	<li>
		Parity <span class="nw">\(p\colon \Z \to \Z/2\):</span> the kernel is the even integers <span class="nw">\(2\Z\);</span> the image is all of <span class="nw">\(\Z/2\).</span>
	</li>
	<li>
		Reduction <span class="nw">\(\Z \to \Z/n\):</span> the kernel is <span class="nw">\(n\Z\),</span> the gold column in Figure 1.3.5; the image is all of <span class="nw">\(\Z/n\).</span>
	</li>
	<li>
		The sign <span class="nw">\(s\colon D_3 \to \{+1, -1\}\):</span> the kernel is everything sent to the identity <span class="nw">\(+1\),</span> namely the rotations
		<span class="nw">\(\{e, r, r^2\}\);</span> the image is <span class="nw">\(\{+1, -1\}\).</span>
	</li>
	<li>
		Doubling on a 6-hour clock, <span class="nw">\(\varphi\colon \Z/6 \to \Z/6\),</span> <span class="nw">\(\varphi(x) = 2x\):</span> the values are
		\(0, 2, 4, 0, 2, 4\) for <span class="nw">\(x = 0, 1, 2, 3, 4, 5\).</span> So \(\ker\varphi = \{0, 3\}\) and
		<span class="nw">\(\im\varphi = \{0, 2, 4\}\).</span>
	</li>
</ul>

<Intuition title="Three ways to think about a kernel">
	<p>
		<strong>What gets crushed.</strong> Think of \(\varphi\) as a lens or a shadow. The kernel is the part of \(G\)
		that the lens cannot see at all — everything flattened onto the single point <span class="nw">\(0\).</span>
	</p>
	<p>
		<strong>The solutions of an equation.</strong> The kernel is the set of solutions \(x\) of the equation
		<span class="nw">\(\varphi(x) = 0\).</span> If you have met linear equations, this is the “homogeneous equation” of linear algebra
		(<Ref to="foundations/linear-algebra" />).
	</p>
	<p>
		<strong>Quiet elements.</strong> Adding an element \(k\) of the kernel to anything changes nothing that
		\(\varphi\) can detect: \(\varphi(a + k) = \varphi(a) + \varphi(k) = \varphi(a) + 0 = \varphi(a)\).
	</p>
	<p>
		And the image is <strong>the shadow</strong>: everything that can be reached, or equivalently the set of \(b\) for
		which the equation \(\varphi(x) = b\) has a solution.
	</p>
</Intuition>

<Proposition title="Kernels and images are subgroups">
	<p>
		For a homomorphism <span class="nw">\(\varphi\colon G \to H\),</span> the kernel is a subgroup of \(G\) and the image is a subgroup of
		<span class="nw">\(H\).</span>
	</p>
</Proposition>

<Proof>
	<p>
		<em>Kernel.</em> We check the three conditions of the subgroup test. It contains <span class="nw">\(0\),</span> since <span class="nw">\(\varphi(0) = 0\).</span>
		It is closed under addition: if \(\varphi(a) = 0\) and <span class="nw">\(\varphi(b) = 0\),</span> then <span class="nw">\(\varphi(a + b) = 0 + 0 = 0\).</span> It
		is closed under inverses: if <span class="nw">\(\varphi(a) = 0\),</span> then <span class="nw">\(\varphi(-a) = -\varphi(a) = -0 = 0\).</span>
	</p>
	<p>
		<em>Image.</em> It contains <span class="nw">\(0 = \varphi(0)\).</span> If \(\varphi(a)\) and \(\varphi(b)\) are in the image, so is their
		sum, because it equals <span class="nw">\(\varphi(a + b)\);</span> and so is <span class="nw">\(-\varphi(a) = \varphi(-a)\).</span>
	</p>
</Proof>

<KeyIdea title="Remember this pair">
	<p>
		In homology, the boundary operation \(\partial\) (read “del” or “boundary”) will be a homomorphism. Its
		<strong>kernel</strong> will be the <span class="tx-gold">cycles</span> — the chains with no boundary, like a loop
		— and its <strong>image</strong> will be the <span class="tx-teal">boundaries</span> — the chains that are the edge
		of something filled in. A hole is a cycle that is not a boundary. Kernel and image are the two words homology is
		built from.
	</p>
</KeyIdea>

<Figure size="wide" num="1.3.6" title="A homomorphism under the lens" hint="Change m, n and φ(1) · hover the top dots">
	<HomomorphismLens />
	{#snippet caption()}
		A homomorphism from \(\Z/m\) is completely decided by where it sends <span class="nw">\(1\),</span> since every element is
		<span class="nw">\(1 + 1 + \dots + 1\).</span> When \(m\) and \(n\) differ, only some choices are allowed (try <span class="nw">\(m = 4\),</span> <span class="nw">\(n = 6\):</span> the
		greyed-out choices would not respect <span class="nw">\(m \cdot 1 = 0\)).</span> The kernel glows gold and the image teal. Hover a dot to see everything that lands in the same place: always a copy of
		the kernel, shifted. Notice that the number of elements in the kernel times the number in the image is always
		<span class="nw">\(m\).</span>
	{/snippet}
</Figure>

<h3 id="injective">The kernel detects injectivity</h3>

<p>
	A function is <Term t="injective">injective</Term> (one-to-one) if different inputs always give different outputs. For
	a general function, checking this means comparing every pair of inputs. For a homomorphism there is a spectacular
	shortcut: you only have to look at what lands on <span class="nw">\(0\).</span>
</p>

<Theorem id="thm-injective" title="Injective exactly when the kernel is trivial">
	<p>
		A homomorphism \(\varphi\colon G \to H\) is injective if and only if <span class="nw">\(\ker\varphi = \{0\}\).</span>
	</p>
</Theorem>

<Proof>
	<p>
		Everything rests on one observation. For any <span class="nw">\(a, b \in G\),</span>
		\[ \varphi(a) = \varphi(b) \iff \varphi(a) - \varphi(b) = 0 \iff \varphi(a - b) = 0 \iff a - b \in \ker\varphi . \]
		(The double arrow \(\iff\) is read “if and only if”: each statement holds exactly when the next one does.) In words:
		<em>two elements have the same image exactly when they differ by an element of the kernel.</em>
	</p>
	<p>
		Suppose \(\varphi\) is injective. If <span class="nw">\(a \in \ker\varphi\),</span> then <span class="nw">\(\varphi(a) = 0 = \varphi(0)\),</span> so \(a = 0\) by
		injectivity. Hence the kernel contains only <span class="nw">\(0\).</span>
	</p>
	<p>
		Conversely, suppose <span class="nw">\(\ker\varphi = \{0\}\),</span> and <span class="nw">\(\varphi(a) = \varphi(b)\).</span> By the observation, \(a - b\) is in
		the kernel, so <span class="nw">\(a - b = 0\),</span> that is, <span class="nw">\(a = b\).</span> Hence \(\varphi\) is injective.
	</p>
</Proof>

<p>
	The observation in the proof is worth more than the theorem. It says that the elements landing on the same point as
	\(a\) are exactly the elements \(a + k\) with \(k\) in the kernel — a copy of the kernel, shifted to <span class="nw">\(a\).</span> You saw
	these shifted copies as the teal column in Figure 1.3.5 and as the highlighted dots in Figure 1.3.6. The kernel
	measures precisely how far \(\varphi\) is from being injective. In the next chapter, these shifted copies get a name
	— <em>cosets</em> — and become the elements of a new group.
</p>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="isomorphism">Same group, different names: isomorphism</h2>

<p>
	Write out the table of the rotations of a square, <span class="nw">\(\{e, \rho, \rho^2, \rho^3\}\),</span> and next to it the addition table
	of <span class="nw">\(\Z/4\).</span> Rename <span class="nw">\(e \mapsto 0\),</span> <span class="nw">\(\rho \mapsto 1\),</span> <span class="nw">\(\rho^2 \mapsto 2\),</span> <span class="nw">\(\rho^3 \mapsto 3\),</span> and the first table
	turns into the second, entry for entry. The two groups are made of different things — turns of a square, hours on a
	clock — but as groups they are indistinguishable.
</p>

<Definition title="Isomorphism">
	<p>
		An <dfn>isomorphism</dfn> is a homomorphism that is also a bijection (one-to-one and onto; see
		<Ref to="foundations/sets-and-functions" />). Two groups \(G\) and \(H\) are <dfn>isomorphic</dfn>, written
		\(G \cong H\) (read <span class="nw">“\(G\)</span> is isomorphic to <span class="nw">\(H\)”),</span> if there is an isomorphism from one to the other.
	</p>
</Definition>

<p>
	An isomorphism is exactly a <em>renaming</em>: a way of matching up the elements of \(G\) and \(H\) one for one so
	that the table of \(G\) becomes the table of <span class="nw">\(H\).</span> (The inverse of an isomorphism is automatically an isomorphism
	too, so the relationship goes both ways.) Some examples:
</p>

<ul>
	<li>The rotations of a square <span class="nw">\(\cong \Z/4\),</span> by <span class="nw">\(\rho^k \mapsto k\).</span></li>
	<li>The two signs \(\{+1, -1\}\) under multiplication <span class="nw">\(\cong \Z/2\),</span> by <span class="nw">\(+1 \mapsto 0\),</span> <span class="nw">\(-1 \mapsto 1\).</span></li>
	<li>The rotations of the triangle <span class="nw">\(\{e, r, r^2\} \cong \Z/3\).</span></li>
	<li>
		<span class="nw">\((\Z/5 \setminus \{0\}, \times) \cong \Z/4\):</span> the powers of \(2\) on a 5-hour clock are <span class="nw">\(2^0 = 1\),</span> <span class="nw">\(2^1 = 2\),</span>
		<span class="nw">\(2^2 = 4\),</span> <span class="nw">\(2^3 = 8 = 3\),</span> so the renaming \(k \mapsto 2^k\) turns clock <em>addition</em> mod 4 into clock
		<em>multiplication</em> mod 5.
	</li>
	<li>
		<span class="nw">\(\Z \cong 2\Z\),</span> by <span class="nw">\(x \mapsto 2x\).</span> An infinite group can be isomorphic to a part of itself — the integers and
		the even integers are “the same group”, merely with every name doubled.
	</li>
</ul>

<Figure size="wide" num="1.3.7" title="An isomorphism is a renaming" hint="Switch the group · try the renamings">
	<RenamingIsomorphism />
	{#snippet caption()}
		The first table is a group’s own table, coloured by the number each element is renamed to. In the second, the
		renamed table is compared cell by cell with the addition table of <span class="nw">\(\Z/4\):</span> green where they agree, rose where they
		do not.
		For the square, two of the six renamings work. For the rectangle, none does.
	{/snippet}
</Figure>

<p>
	How can we be sure that <em>no</em> renaming turns the rectangle’s table into that of <span class="nw">\(\Z/4\)?</span> Trying all six is one
	way, but there is a better one. An isomorphism preserves every property that can be stated in terms of the operation
	— being abelian, the number of subgroups, the orders of elements. In \(\Z/4\) the element \(1\) has order <span class="nw">\(4\).</span> In
	the rectangle group every element has order \(1\) or <span class="nw">\(2\):</span> every symmetry of a rectangle, done twice, is
	<span class="nw">\(e\).</span> An isomorphism would have to send \(1\) to an element of order <span class="nw">\(4\),</span> and there is none. So the two groups are
	not isomorphic, even though both have four elements.
</p>

<p>
	Similarly, \(\Z/6\) and \(D_3\) both have six elements, but \(\Z/6\) is abelian and \(D_3\) is not, so they cannot be
	isomorphic. This is the strategy of <em>invariants</em>, the same one topology uses to prove that two shapes are
	different (<Ref to="prelude/shape-of-a-question" />): find a property that isomorphic groups must share, and show
	that it differs.
</p>

<Remark title="Giving the same name to different things">
	<p>
		Henri Poincaré wrote that “mathematics is the art of giving the same name to different things.” Isomorphism is
		that art made precise. When we write <span class="nw">\(G \cong H\),</span> we are saying that, as far as the group operation can tell,
		\(G\) and \(H\) are the same thing with different labels. Most of the time we will happily treat isomorphic groups
		as equal — homology groups are only ever determined “up to isomorphism” — but the symbol \(\cong\) is there to
		remind us that a renaming has taken place (the levels of sameness were introduced in
		<Ref to="prelude/reading-math" />).
	</p>
</Remark>

<p>
	We now have the whole vocabulary of the chapter: groups, abelian groups, subgroups, generators, homomorphisms,
	kernels, images and isomorphisms. The next chapter uses it to build new groups out of old ones — above all, by
	collapsing a subgroup to zero.
</p>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Group or not?">
	<p>
		Decide whether each of the following is a group. If it is not, name a rule that fails. (a) The even integers under
		addition. (b) The set \(\{0\}\) under addition. (c) The positive real numbers under multiplication. (d)
		\(\{1, 2, 3\}\) under multiplication on a 4-hour clock.
	</p>
	{#snippet hint()}
		<p>For each one, check closure first, then look for an identity and for inverses.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(a) Yes: \(0\) is even, sums and negatives of even numbers are even. (b) Yes: it is the trivial group. (c) Yes:
			a product of positive numbers is positive, the identity is <span class="nw">\(1\),</span> and the inverse of \(a\) is <span class="nw">\(1/a\),</span> which is
			positive. (d) No: \(2 \times 2 = 4 = 0\) on a 4-hour clock, and \(0\) is not in the set, so closure fails. (Also
			\(2\) has no inverse: <span class="nw">\(2 \times 1 = 2\),</span> <span class="nw">\(2 \times 2 = 0\),</span> <span class="nw">\(2 \times 3 = 6 = 2\),</span> never <span class="nw">\(1\).)</span>
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Two flips make a rotation">
	<p>
		Use Figure 1.3.1 (or the permutation of the corners) to compute \(f_1 f_2\) and \(f_2 f_1\) in <span class="nw">\(D_3\).</span> What kind of
		move is the result? Are the two answers related?
	</p>
	{#snippet hint()}
		<p>\(f_1 f_2\) means “first <span class="nw">\(f_2\),</span> then <span class="nw">\(f_1\)”.</span> Press Reset, then <span class="nw">\(f_2\),</span> then <span class="nw">\(f_1\).</span></p>
	{/snippet}
	{#snippet solution()}
		<p>
			\(f_1 f_2 = r\) and <span class="nw">\(f_2 f_1 = r^2\).</span> Two flips turn the card over twice, so it ends face up: the result is a
			rotation. The two answers are inverses of each other, as the socks-and-shoes rule predicts:
			<span class="nw">\((f_1 f_2)^{-1} = f_2^{-1} f_1^{-1} = f_2 f_1\),</span> because each flip is its own inverse.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="The subgroups of ℤ/6">
	<p>
		Find all subgroups of <span class="nw">\(\Z/6\).</span> Why is \(\{0, 1, 5\}\) not one of them, even though it contains \(0\) and the
		inverse of each of its elements?
	</p>
	{#snippet solution()}
		<p>
			There are four: <span class="nw">\(\{0\}\),</span> <span class="nw">\(\{0, 3\}\),</span> \(\{0, 2, 4\}\) and \(\Z/6\) itself — one for each divisor \(1, 2, 3, 6\)
			of \(6\) (they are <span class="nw">\(\langle 0 \rangle\),</span> <span class="nw">\(\langle 3 \rangle\),</span> <span class="nw">\(\langle 2 \rangle\),</span> <span class="nw">\(\langle 1 \rangle\)).</span>
			The set \(\{0, 1, 5\}\) is not closed: \(1 + 1 = 2\) is missing. Any subgroup containing \(1\) contains everything
			that \(1\) generates, which is all of <span class="nw">\(\Z/6\).</span>
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Orders on a 12-hour clock">
	<p>
		Find the order of every element of <span class="nw">\(\Z/12\).</span> Which elements generate <span class="nw">\(\Z/12\)?</span> Check your answers with Figure
		1.3.4.
	</p>
	{#snippet solution()}
		<p>
			Using order <span class="nw">\(= 12/\gcd(12, k)\):</span> \(0\) has order <span class="nw">\(1\);</span> \(1, 5, 7, 11\) have order <span class="nw">\(12\);</span> \(2, 10\) have order
			<span class="nw">\(6\);</span> \(3, 9\) have order <span class="nw">\(4\);</span> \(4, 8\) have order <span class="nw">\(3\);</span> \(6\) has order <span class="nw">\(2\).</span> The generators are the
			elements of order <span class="nw">\(12\):</span> <span class="nw">\(1, 5, 7, 11\),</span> exactly the numbers sharing no factor with <span class="nw">\(12\).</span>
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Doubling on a 6-hour clock">
	<p>
		Show that <span class="nw">\(\varphi\colon \Z/6 \to \Z/6\),</span> <span class="nw">\(\varphi(x) = 2x\),</span> is a homomorphism. Find its kernel and image. Is it
		injective? Surjective?
	</p>
	{#snippet solution()}
		<p>
			It is a homomorphism because \(2(a + b) = 2a + 2b\) (doubling distributes over addition, and reducing mod 6 at
			the end does not change that). The values at \(0, 1, 2, 3, 4, 5\) are <span class="nw">\(0, 2, 4, 0, 2, 4\).</span> So
			\(\ker\varphi = \{0, 3\}\) and <span class="nw">\(\im\varphi = \{0, 2, 4\}\).</span> It is not injective, since the kernel contains
			\(3 \neq 0\) (indeed <span class="nw">\(\varphi(0) = \varphi(3)\)),</span> and not surjective, since \(1\) is never reached. Notice that
			\(|\ker\varphi| \cdot |\im\varphi| = 2 \cdot 3 = 6\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Which homomorphisms exist?">
	<p>
		Explain why there is no homomorphism \(\varphi\colon \Z/4 \to \Z/6\) with <span class="nw">\(\varphi(1) = 1\).</span> Then find all
		homomorphisms <span class="nw">\(\Z/4 \to \Z/6\).</span>
	</p>
	{#snippet hint()}
		<p>In <span class="nw">\(\Z/4\),</span> <span class="nw">\(1 + 1 + 1 + 1 = 0\).</span> Apply \(\varphi\) to both sides.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Applying \(\varphi\) to \(1 + 1 + 1 + 1 = 0\) gives \(4\varphi(1) = \varphi(0) = 0\) in <span class="nw">\(\Z/6\).</span> With
			\(\varphi(1) = 1\) this would say \(4 = 0\) on a 6-hour clock, which is false. In general a homomorphism is
			determined by \(k = \varphi(1)\) (then <span class="nw">\(\varphi(x) = kx\)),</span> and the only condition is \(4k = 0\) in <span class="nw">\(\Z/6\),</span>
			i.e. \(4k\) is a multiple of <span class="nw">\(6\).</span> Checking <span class="nw">\(k = 0, \dots, 5\):</span> <span class="nw">\(4k = 0, 4, 8, 12, 16, 20\),</span> and only
			\(0\) and \(12\) are multiples of 6. So there are exactly two homomorphisms: \(x \mapsto 0\) and <span class="nw">\(x \mapsto 3x\).</span>
			Figure 1.3.6 with <span class="nw">\(m = 4\),</span> \(n = 6\) shows the same two choices.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Socks and shoes">
	<p>
		Find two symmetries \(g, h\) of the triangle with <span class="nw">\((gh)^{-1} \neq g^{-1} h^{-1}\).</span> Why can this never happen in an
		abelian group?
	</p>
	{#snippet solution()}
		<p>
			Take <span class="nw">\(g = r\),</span> <span class="nw">\(h = f_1\).</span> Then <span class="nw">\(gh = r f_1 = f_3\),</span> whose inverse is <span class="nw">\(f_3\).</span> But
			<span class="nw">\(g^{-1} h^{-1} = r^2 f_1 = f_2\).</span> The correct rule is <span class="nw">\((gh)^{-1} = h^{-1} g^{-1} = f_1 r^2\),</span> which is indeed
			<span class="nw">\(f_3\).</span> In an abelian group <span class="nw">\(h^{-1} g^{-1} = g^{-1} h^{-1}\),</span> so both formulas agree; in additive notation it is
			the familiar <span class="nw">\(-(a + b) = -a - b\).</span>
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="When everything undoes itself">
	<p>
		Suppose that in a group \(G\) every element is its own inverse: \(gg = e\) for all <span class="nw">\(g\).</span> Prove that \(G\) is
		abelian. Which group from this chapter is an example?
	</p>
	{#snippet hint()}
		<p>Apply the hypothesis to the element <span class="nw">\(ab\),</span> and use the socks-and-shoes rule.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Since every element is its own inverse, <span class="nw">\(ab = (ab)^{-1}\).</span> By the socks-and-shoes rule,
			<span class="nw">\((ab)^{-1} = b^{-1} a^{-1}\),</span> and again each element is its own inverse, so <span class="nw">\(b^{-1}a^{-1} = ba\).</span> Putting the
			three equalities together, \(ab = ba\) for all <span class="nw">\(a, b\).</span> The symmetries of a rectangle are an example: <span class="nw">\(hh = vv =
			tt = e\),</span> and indeed the group is abelian.
		</p>
	{/snippet}
</Exercise>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			A <strong>group</strong> is a set with an operation that is closed and associative, has an identity element, and
			has inverses. The symmetries of a triangle and the arithmetic of a clock are both groups.
		</li>
		<li>
			Identities and inverses are unique; <span class="nw">\((gh)^{-1} = h^{-1}g^{-1}\);</span> the cancellation law makes every Cayley table a
			Latin square.
		</li>
		<li>
			A group is <strong>abelian</strong> if \(ab = ba\) always. \(D_3\) is not abelian. Abelian groups are written
			additively, and all the groups of homology are abelian.
		</li>
		<li>
			<strong>Subgroups</strong> are groups inside groups; \(\langle a \rangle\) is the subgroup generated by <span class="nw">\(a\);</span>
			cyclic groups have a single generator; the <strong>order</strong> of \(k\) in \(\Z/n\) is <span class="nw">\(n/\gcd(n,k)\);</span> every
			subgroup of \(\Z\) is some <span class="nw">\(n\Z\).</span>
		</li>
		<li>
			A <strong>homomorphism</strong> respects the operation. Its <strong>kernel</strong> (what is crushed to <span class="nw">\(0\))</span>
			and <strong>image</strong> (what is reached) are subgroups, and it is injective exactly when its kernel is
			<span class="nw">\(\{0\}\).</span> Elements with the same image differ by an element of the kernel.
		</li>
		<li>
			An <strong>isomorphism</strong> is a bijective homomorphism — a renaming. Isomorphic groups share every
			structural property, which is how we prove two groups are different.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />

<style>
	/* keep short formulas together with their punctuation */
	.nw {
		white-space: nowrap;
	}
</style>

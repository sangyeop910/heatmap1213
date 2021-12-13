
document.getElementsByClassName("icol-3 ")[0].children[0].addEventListener('click',shopHanlder);
document.getElementsByClassName("icol-3 ")[0].children[1].addEventListener('click',downloadHandler);
document.getElementsByClassName("icol-3 ")[0].children[2].addEventListener('click',configureHandler);

function shopHanlder(){ alert('set'); }
function downloadHandler(){ alert('download'); }
function configureHandler(){
	const configureModal = document.getElementsByClassName("pro_li_plot_pop pop01")[0];
	configureModal.setAttribute('style','display:block;')
}	

let hmap_height;
let items =[];
let items2 =[];
let imax;
let imin;
let square;
let size = 20;
let matrix;
let meta;
let meta_filter;
let columns;
let pat;
let meta_colr = [];
let color11 = ["#F74949", "#3729ff", "#68ff54", "#ffff54", "#ffbe54", 
    "#54ffee", "#f654ff", "#a154ff", "#ff5498", "#54ff93", "#c49578"];
/*d3.csv("/rdap/data/TCGA-BRCA.GDC_phenotype_parse.tsv").then(data2 => {
	let sub_sample = [];
	let samples = [];
	meta = data2;
	//==Group 색상 구분==//
	for(let i=0; i<meta.length; i++){
		sub_sample.push(meta[i]["submitter_id.samples"])
	}
	//console.log(sub_sample)
	for (let i=0; i<meta.length; i++){
		samples.push(meta[i]["sample_type.samples"])
	}
	//console.log(samples)
	colrbox = [];
	
	for(let i=0; i<samples.length; i++){
		if(samples[i] == "Primary Tumor"){
			colrbox.push(0)		
		}
		if(samples[i] == "Solid Tissue Normal"){
			colrbox.push(1)		
		}
	}
	//colrbox.length = columns.length;
	let color2 = d3.scaleOrdinal()
		.domain(colrbox)
		.range(["red", "blue"])

	let gr_svg = d3.select("#group_color").append("svg")
		.attr("style", "overflow: visible;")
		.attr("width", 200)
		.attr("height", 20);
	gr_svg.selectAll("group_color")
		.data(colrbox)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {return 50 + i*(0.955)})
		.attr("y", 160)
		.attr("width", 0.9)
		.attr("height", 8)
		.style("fill", function(d){ return color2(d)})

//==Group 색상 구분==//
});*/

//=========================heatmap=====================================//
//const heatmap = d3.json("/rdap/heatmap/get_data").then(data => {
const heatmap = d3.json("/rdap/heatmap/get_data").then(data => {
	/*matrix : gene data
	meta : patients, group, response data
	rows : gene 이름
	items : 각 patients속 값
	columns : 각 patients의 번호 ex)pt1
	*/
	console.log(data)
	matrix = JSON.parse(data["matrix"]);
	meta = JSON.parse(data["meta"]);
	
	let pinfo;
	let rows = [];
	let mx = [];
	let mn = [];
	let meta_test = [];
	let mt_idx = [];
	let mt_filt = [];
	
	for(let i=0; i<meta.length; i++){
		meta_test.push(Object.values(meta[i])[1])
	}
	
//==columns==//
	pinfo = Object.keys(matrix[0]);
	
	columns = pinfo.filter((pinfo) => pinfo !== "Ensembl_ID")//patients를 columns으로
	
	for(let i=0; i<meta_test.length; i++){
		for(let j=0; j<columns.length; j++){
			if(columns[j] == meta_test[i]){
				mt_idx.push(i);//columns[j]와 일치하는 meta의 인덱스
				mt_filt.push(meta_test[j]);//columns[j]와 일치하는 string
			}
		}
	}
	for (let i=0; i<mt_idx.length; i++){
		meta_colr.push(meta[mt_idx[i]]);//meta에서 현재 heatmap을 그리는 데 사용된 TCGA이름들과 해당 샘플 타입을 추출
	}
	
	let btn1 = document.getElementsByClassName('btn btn_01');
	btn1[0].addEventListener('click', gene_set);
	function gene_set(){
		console.log(meta_colr)
	}
	
	
	//square = Math.floor((1000/pat)/1.18);
//==columns==//
	
//==item2==//
	items = matrix.map(d => columns.map((a, i) => d[a]));//숫자 값(string 상태)
	for(let i=0; i<items.length; i++){
		items2[i] = new Array();
	}
	
	for (let i=0; i<items.length; i++){
		for(let j=0; j<columns.length; j++){
			items2[i].push(Number.parseFloat(items[i][j]))//숫자 값(int 상태)
		}
	}
	
//==item2==//
	
//==item max==//
	for (let i=0; i<100; i++){
		mx.push(Math.max.apply(null, items2[i]))
	}
	imax = Math.max.apply(null, mx)	
//==item max==//

//==item min==//
	for (let i=0; i<100; i++){
		mn.push(Math.min.apply(null, items2[i]))
	}
	imin = Math.min.apply(null, mn)	
//==item min==//
	
	items.length = 0;

//==rows==//
	for (let i=0; i<matrix.length; i++){//Ensembl_ID들을 gene에 담는다
		rows.push(matrix[i]["Ensembl_ID"])
	}
	
	rows.length = 100;//세로
//==rows==//
	
	let sq_Width = Math.floor(800/(columns.length+0.05));
	
	hmap_height = (sq_Width*rows.length)+200;
	
    const heatmapElement = document.getElementById("heatmap");
		let heatmap = new UnipeptVisualizations.Heatmap(heatmapElement, items2, rows, columns, {
			minColor: '#ffffff',        	
			maxColor: '#0000ff',
            colorBuckets: 100,
            width: 1000,
            height: hmap_height,
            enableTooltips: true,
			dendrogramEnabled: true,
            labelColor: "#000000",
            highlightSelection: true,
            highlightFontColor: "red",
            animationsEnabled: true,
        });

//=================우측 상단 Group===============//
	const arrs = [];
	
	d3.select("#heatmap_legend").append("div").text("group").attr("style","margin-left:10px;");
	let legend_svg = d3.select("#heatmap_legend").append("svg")
		.attr("width", 200)
		.attr("height", 200);
	
	for(let i=0; i<meta_colr.length; i++){
		arrs.push(Object.values(meta_colr[i])[0])
	}
	
	const set = new Set(arrs);
	const keys = [...set];
	console.log(keys)
	let color = d3.scaleOrdinal()
		.domain(keys)
		.range(color11);

	legend_svg.selectAll("mydots")
		.data(keys)
		.enter()
		.append("rect")
		.attr("x", 10)
    	.attr("y", function(d,i){ return 10 + i*(size+5)})
    	.attr("width", size)
    	.attr("height", size)
    	.style("fill", function(d){ return color(d)})

	legend_svg.selectAll("mylabels")
		.data(keys)
		.enter()
		.append("text")
    	.attr("x", 10 + size*1.2)
	    .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)})
	    .style("fill", function(d){ return color(d)})
    	.text(function(d){ return d})
    	.attr("text-anchor", "left")
    	.style("alignment-baseline", "middle")  

//=================우측 상단 Group===============//
	let colrbox=[];
	
	for(let i=0; i<meta_colr.length; i++){
		if(Object.values(meta[i])[0] == keys[0]){
			colrbox.push(0)	
		}else if(Object.values(meta[i])[0] == keys[1]){
			colrbox.push(1)
		}else if(Object.values(meta[i])[0] == keys[2]){
			colrbox.push(2)
		}else if(Object.values(meta[i])[0] == keys[2]){
			colrbox.push(3)
		}
	}
	console.log(colrbox)
	let color2 = d3.scaleOrdinal()
		.domain(colrbox)
		.range(color11)
	
	let gr_svg = d3.select("#group_color").append("svg")
		.attr("style", "overflow: visible;")
		.attr("width", 220)
		.attr("height", 20);
	gr_svg.selectAll("group_color")
		.data(colrbox)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {return 100 + i*(sq_Width+0.05)})
		.attr("y", hmap_height-50)
		.attr("width", sq_Width)
		.attr("height", sq_Width)
		.style("fill", function(d){ return color2(d)})

//=================우측 상단 Linear===============//

	let svg = d3.select("#heatmap_legend").append("svg")
		.attr("style", "overflow: visible;")
		.attr("width", 180)
		.attr("height", 30);
		
	let linearV = d3.scaleLinear()
		.domain([imin, imax])
		.range(['#ffffff', '#0000ff']);
	svg.append("g")
	    .attr("class", "legendV")
    	.attr("transform", "translate(10,10)");

	let legendV = d3.legendColor()
		.shapeWidth(20)
		.shapeHeight(15)
		.cells(5)
		.title("Linear")
		.labelFormat(d3.format('.0f'))
		.scale(linearV);	
	svg.select(".legendV").call(legendV);

//=================우측 상단 Linear===============//
});
//==================heatmap======================//
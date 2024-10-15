#include<stdio.h>
#include<conio.h>
#include<string.h>
#include<ctype.h>
int main()
{
    FILE *finp,*foptab,*fsymtab,*foutput;
    int i,j=0,len;
    char end_addr[10],addr[5],symb_addr[5],opcode[5],start_addr[10],st_label[50],mnemo[10],inp_oper[10],symbol[10],op_mnemo[10],st_endloc[10],st_len[5];

    printf("\n*** PASS 2 Assembler ****\n\n");
    finp=fopen("input.txt","r");
    foptab=fopen("optab.txt","r");
    fsymtab=fopen("symtab.txt","r");
    foutput=fopen("output.txt","w+");



    fscanf(finp,"%s%s%s",st_label,mnemo,inp_oper);
    if(strcmp(mnemo,"START")==0)
    {
        strcpy(start_addr,inp_oper);
    }


    printf("H^%s^%s^%s\nT^00^",st_label,start_addr,start_addr);
    fprintf(foutput,"H^%s^%s^\n  T^00^",st_label,start_addr);
    fscanf(finp,"%s%s%s%s",addr,st_label,mnemo,inp_oper);
    while(strcmp(mnemo,"END")!=0)
    {
        fscanf(foptab,"%s%s",op_mnemo,opcode);
        while(!feof(foptab))
        {
            if(strcmp(mnemo,op_mnemo)==0)
            {

                fscanf(fsymtab,"%s%s",symb_addr,symbol);
                while(!feof(fsymtab))
                {
                    if(strcmp(inp_oper,symbol)==0)
                    {
                        printf("%s%s^",opcode,symb_addr);
                        fprintf(foutput,"%s%s^",opcode,symb_addr);
                        break;
                    }
                    else
                        fscanf(fsymtab,"%s%s",symb_addr,symbol);
                }
             break;
            }
            else
                fscanf(foptab,"%s%s",op_mnemo,opcode);
         }
        if((strcmp(mnemo,"BYTE")==0)||(strcmp(mnemo,"WORD")==0))
        {
            if(strcmp(mnemo,"WORD")==0)
            {
                printf("0000%s^",inp_oper);
                fprintf(foutput,"0000%s^",inp_oper);
            }
            else
            {
                len=strlen(inp_oper);
                for(i=2;i<len;i++)
                {
                    printf("%d",inp_oper[i]);
                    fprintf(foutput,"%d",inp_oper[i]);
                }
                printf("^");
                fprintf(foutput,"^");
            }
         }
    fscanf(finp,"%s%s%s%s",addr,st_label,mnemo,inp_oper);
    rewind(foptab);
    rewind(fsymtab);
	strcpy(end_addr,addr);


    }

    printf("\nE^00%s",start_addr);
    fprintf(foutput,"\nE^00%s",start_addr);
    len=atoi(end_addr)-atoi(start_addr);

    fclose(finp);
    fclose(foptab);
    fclose(fsymtab);


    rewind(foutput);
    fscanf(foutput,"%s",st_label);

//printf("\n\n%s",st_label);

    //itoa(len, st_len, 10);
    rewind(foutput);
   fprintf(foutput,"%s",st_label);
   fprintf(foutput,"%X\n",len);




    fclose(foutput);

    printf("\n\n Output File Generated......");
    getch();
}